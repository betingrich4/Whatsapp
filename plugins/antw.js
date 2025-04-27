// antiword.js
import config from "../config.cjs";

const antiwordDB = new Map(); // { groupJid: { active: boolean, bannedWords: Set<string>, strictMode: boolean } }
const warnedUsersDB = new Map(); // { groupJid: Map<userJid, {count: number, lastWarning: Date}> }

// Default banned words list (English)
const DEFAULT_BANNED_WORDS = new Set([
  // Profanity
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'piss', 'cock', 'pussy', 'whore',
  'slut', 'bastard', 'motherfucker', 'douche', 'fag', 'retard', 'nigger', 'nigga',
  
  // Sexual terms
  'sex', 'porn', 'rape', 'pedo', 'incest', 'orgasm', 'masturbat', 'blowjob', 'dildo',
  
  // Hate speech
  'kill', 'murder', 'terrorist', 'hitler', 'nazi', 'racist', 'kkk', 'islamophob',
  
  // Drugs
  'cocaine', 'heroin', 'meth', 'lsd', 'ecstasy', 'weed', 'marijuana', 'opium',
  
  // Bypass attempts
  'f u c k', 's h i t', 'f*ck', 'sh!t', 'b!tch', '@$$', '5hit', 'fuk'
]);

const antiword = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable antiword
    if (cmd.startsWith("antiword on")) {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*\n\n> *Try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Command for admins only*\n\n> *Request admin role*");
      }

      const words = cmd.split(' ').slice(2).filter(w => !w.startsWith('-'));
      const bannedWords = new Set([...DEFAULT_BANNED_WORDS, ...words]);
      
      antiwordDB.set(m.from, {
        active: true,
        bannedWords: bannedWords,
        strictMode: cmd.includes('-strict')
      });
      
      warnedUsersDB.set(m.from, new Map());
      
      return m.reply(
        `*Antiword activated!*\n\n` +
        `> *Mode:* ${cmd.includes('-strict') ? 'STRICT (delete all messages)' : 'NORMAL (filter bad words)'}\n` +
        `> *Banned words:* ${bannedWords.size}\n` +
        `> *Custom words added:* ${words.length > 0 ? words.join(', ') : 'None'}`
      );
    }

    // Disable antiword
    if (cmd === "antiword off") {
      if (!m.isGroup) return m.reply("*Command only for groups!*\n\n> *Please try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Only admins can disable antiword!*\n\n> *Contact group admin*");
      }

      antiwordDB.delete(m.from);
      warnedUsersDB.delete(m.from);
      return m.reply("*Antiword is now disabled.*\n\n> *Messages will not be filtered*");
    }

    // Add words to filter
    if (cmd.startsWith("antiword add")) {
      if (!m.isGroup) return m.reply("*Command only for groups!*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Only admins can modify banned words!*");
      }

      const wordsToAdd = cmd.split(' ').slice(2);
      if (wordsToAdd.length === 0) {
        return m.reply("*Please specify words to add*\n\n> Example: *antiword add word1 word2*");
      }

      const groupData = antiwordDB.get(m.from) || { 
        active: true, 
        bannedWords: new Set([...DEFAULT_BANNED_WORDS]),
        strictMode: false
      };
      
      wordsToAdd.forEach(word => groupData.bannedWords.add(word.toLowerCase()));
      antiwordDB.set(m.from, groupData);
      
      return m.reply(
        `*Added ${wordsToAdd.length} word(s) to filter*\n\n` +
        `> New words: ${wordsToAdd.join(', ')}\n` +
        `> Total banned words: ${groupData.bannedWords.size}`
      );
    }

    // List banned words
    if (cmd === "antiword list") {
      if (!m.isGroup) return m.reply("*Command only for groups!*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Only admins can view banned words!*");
      }

      const groupData = antiwordDB.get(m.from);
      if (!groupData?.active) {
        return m.reply("*Antiword is not active in this group*");
      }

      const words = [...groupData.bannedWords].slice(0, 50);
      return m.reply(
        `*Banned Words List (${groupData.bannedWords.size})*\n\n` +
        `> ${words.join(', ')}${groupData.bannedWords.size > 50 ? '\n> ...and more' : ''}`
      );
    }

    // Message filtering with REMOVAL
    if (antiwordDB.get(m.from)?.active && (m.mtype === 'conversation' || m.mtype === 'extendedTextMessage')) {
      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;
      
      // Skip if admin or bot owner
      if (senderAdmin || m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') return;

      const groupData = antiwordDB.get(m.from);
      const messageText = m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : m.body;
      const lowerText = messageText.toLowerCase();

      // Strict mode - delete all messages
      if (groupData.strictMode) {
        await gss.sendMessage(m.from, { delete: m.key });
        return m.reply(
          `*@${m.sender.split('@')[0]} - Strict mode active!*\n> All messages are automatically deleted`,
          null,
          { mentions: [m.sender] }
        );
      }

      // Normal mode - check for banned words
      const foundWords = [...groupData.bannedWords].filter(word => 
        lowerText.includes(word) || 
        new RegExp(word.split('').join('[\\s\\W]*')).test(lowerText) // Detect spaced-out words
      );

      if (foundWords.length > 0) {
        // 1. Delete the offensive message
        await gss.sendMessage(m.from, { delete: m.key });

        // 2. Update warning count
        const warnedUsers = warnedUsersDB.get(m.from) || new Map();
        const userData = warnedUsers.get(m.sender) || { count: 0, lastWarning: 0 };
        
        // Reset if last warning was >24 hours ago
        if (Date.now() - userData.lastWarning > 86400000) {
          userData.count = 0;
        }

        userData.count++;
        userData.lastWarning = Date.now();
        warnedUsers.set(m.sender, userData);
        warnedUsersDB.set(m.from, warnedUsers);

        // 3. REMOVE USER after 3 warnings
        if (userData.count >= 3) {
          try {
            // Verify bot is admin before removing
            const botAdmin = groupMetadata.participants.find(p => p.id === gss.user.id)?.admin;
            if (!botAdmin) {
              return m.reply("*I need admin rights to remove members!*");
            }

            await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
            
            // Notify group
            await gss.sendMessage(
              m.from, 
              {
                text: `🚫 @${m.sender.split('@')[0]} was removed for:\n> ${foundWords.slice(0, 3).join(', ')}${foundWords.length > 3 ? '...' : ''}\n> Warnings: 3/3`,
                mentions: [m.sender]
              }
            );
            
            // Reset warnings
            warnedUsers.delete(m.sender);
          } catch (removeError) {
            console.error("Removal failed:", removeError);
            return m.reply("*Failed to remove violator!*");
          }
        } else {
          // Send warning
          await gss.sendMessage(
            m.from,
            {
              text: `⚠️ @${m.sender.split('@')[0]} - Warning ${userData.count}/3\n> Violation: ${foundWords.slice(0, 3).join(', ')}${foundWords.length > 3 ? '...' : ''}`,
              mentions: [m.sender]
            }
          );
        }
      }
    }
  } catch (error) {
    console.error("Antiword Error:", error);
    m.reply("*⚠️ Error processing antiword*");
  }
};

export default antiword;
