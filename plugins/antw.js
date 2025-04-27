// badwords.js
import config from "../config.cjs";

const antiwordDB = new Map(); // { groupJid: { active: boolean, bannedWords: Set<string>, strictMode: boolean } }
const warnedUsersDB = new Map(); // { groupJid: Map<userJid, {count: number, lastWarning: Date}> }

// Enhanced bad words list (English + Sinhala/Tamil)
const DEFAULT_BANNED_WORDS = new Set([
  // English profanity
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'piss', 'cock', 'pussy', 
  'whore', 'slut', 'bastard', 'motherfucker', 'douche', 'fag', 'retard',
  'nigger', 'nigga', 'wtf', 'xxx', 'sex', 'porn', 'rape', 'pedo', 'incest',
  
  // Sinhala/Tamil profanity
  'huththa', 'pakaya', 'ponnaya', 'hutto', 'mia', 'balla', 'naraka', 'kella',
  'gona', 'pako', 'thopa', 'kudda', 'kussi', 'kota', 'lansi', 'lansi',
  'bithara', 'biththara', 'bunnia', 'bunniah', 'modaya', 'moodaya', 'meka',
  'moko', 'mokadda', 'punnakku', 'parippu', 'kondamma', 'kondammah',
  
  // Bypass attempts
  'f u c k', 's h i t', 'f*ck', 'sh!t', 'b!tch', '@$$', '5hit', 'fuk', 'fuq',
  'wtff', 'xxx', 'sexx', 's e x', 'p o r n', 'h u t h t h a', 'p a k a y a',
  'h u t t o', 'p o n n a y a'
]);

const antiword = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable antiword
    if (cmd.startsWith("antiword on")) {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Command for admins only*");
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
        `*Antiword activated!*\n` +
        `> Mode: ${cmd.includes('-strict') ? 'STRICT' : 'NORMAL'}\n` +
        `> Banned words: ${bannedWords.size}\n` +
        `> Custom words: ${words.length > 0 ? words.join(', ') : 'None'}`
      );
    }

    // Disable antiword
    if (cmd === "antiword off") {
      if (!m.isGroup) return m.reply("*Group command only*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Admin command only*");
      }

      antiwordDB.delete(m.from);
      warnedUsersDB.delete(m.from);
      return m.reply("*Antiword disabled*");
    }

    // Message filtering
    if (antiwordDB.get(m.from)?.active && (m.mtype === 'conversation' || m.mtype === 'extendedTextMessage')) {
      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;
      
      // Skip if admin or owner
      if (senderAdmin || m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') return;

      const groupData = antiwordDB.get(m.from);
      const messageText = m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : m.body;
      const lowerText = messageText.toLowerCase();

      // Strict mode - delete all messages
      if (groupData.strictMode) {
        await gss.sendMessage(m.from, { delete: m.key });
        return m.reply(
          `*@${m.sender.split('@')[0]} - Strict mode active!*`,
          null,
          { mentions: [m.sender] }
        );
      }

      // Check for banned words
      const foundWords = [...groupData.bannedWords].filter(word => 
        lowerText.includes(word) || 
        new RegExp(word.split('').join('[\\s\\W]*')).test(lowerText)
      );

      if (foundWords.length > 0) {
        // Delete message
        await gss.sendMessage(m.from, { delete: m.key });

        // Warning system
        const warnedUsers = warnedUsersDB.get(m.from) || new Map();
        const userData = warnedUsers.get(m.sender) || { count: 0, lastWarning: 0 };
        
        // Reset if >24 hours since last warning
        if (Date.now() - userData.lastWarning > 86400000) {
          userData.count = 0;
        }

        userData.count++;
        userData.lastWarning = Date.now();
        warnedUsers.set(m.sender, userData);
        warnedUsersDB.set(m.from, warnedUsers);

        // Remove after 3 warnings
        if (userData.count >= 3) {
          try {
            const botAdmin = groupMetadata.participants.find(p => p.id === gss.user.id)?.admin;
            if (!botAdmin) return m.reply("*I need admin rights to remove members*");

            await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
            
            await gss.sendMessage(
              m.from, 
              {
                text: `🚫 @${m.sender.split('@')[0]} removed for:\n> ${foundWords.slice(0, 3).join(', ')}${foundWords.length > 3 ? '...' : ''}\n> Warnings: 3/3`,
                mentions: [m.sender]
              }
            );
            
            warnedUsers.delete(m.sender);
          } catch (e) {
            console.error("Removal failed:", e);
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
  }
};

export default antiword;
