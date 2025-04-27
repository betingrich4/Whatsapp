import config from "../config.cjs";

const antiwordDB = new Map(); // { groupJid: boolean }
const warnedUsersDB = new Map(); // { groupJid: Set<userJid> }

// Default banned words (expanded list)
const DEFAULT_BANNED_WORDS = [
  // Profanity
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore',
  'slut', 'bastard', 'motherfucker', 'fag', 'retard', 'nigger', 'nigga',
  
  // Sexual content
  'porn', 'rape', 'pedo', 'incest', 'orgasm', 'blowjob', 'dildo',
  
  // Hate speech
  'kill', 'murder', 'terrorist', 'hitler', 'nazi', 'racist', 'kkk',
  
  // Bypass attempts
  'f u c k', 'f*ck', 'sh!t', 'b!tch', '@$$', 'f@ck', 'f.uck', 'biatch'
];

// Case-insensitive regex for banned words
const bannedWordsRegex = new RegExp(
  DEFAULT_BANNED_WORDS.map(word => 
    word.split('').join('[\\s\\W]*') // Match spaced/symbol-inserted words
  ).join('|'), 
  'gi'
);

const antiword = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable antiword
    if (cmd === "antiword on") {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Command for admins only*");
      }

      antiwordDB.set(m.from, true);
      return m.reply("*Antiword activated!*\n\n> *Banned words will be auto-deleted.*");
    }

    // Disable antiword
    if (cmd === "antiword off") {
      if (!m.isGroup) return m.reply("*Command only for groups!*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Only admins can disable antiword!*");
      }

      antiwordDB.delete(m.from);
      warnedUsersDB.delete(m.from);
      return m.reply("*Antiword disabled.*\n\n> *Messages will not be filtered.*");
    }

    // Auto-delete banned words (like antibot.js)
    if (antiwordDB.get(m.from) && (m.mtype === 'conversation' || m.mtype === 'extendedTextMessage')) {
      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      // Skip if admin or bot owner
      if (senderAdmin || m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') return;

      const messageText = m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : m.body;
      
      // Check for banned words
      if (bannedWordsRegex.test(messageText)) {
        // 1. Delete the message
        await gss.sendMessage(m.from, { delete: m.key });

        // 2. Warn the user
        const warnedUsers = warnedUsersDB.get(m.from) || new Set();
        
        if (warnedUsers.has(m.sender)) {
          // Remove on repeat offense
          await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
          return m.reply(`*@${m.sender.split('@')[0]} was removed for using banned words.*`);
        } else {
          // First warning
          warnedUsers.add(m.sender);
          warnedUsersDB.set(m.from, warnedUsers);
          await m.reply(`*@${m.sender.split('@')[0]} - Banned word detected!*\n> *This is your first warning.*`);
        }
      }
    }
  } catch (error) {
    console.error("Antiword Error:", error);
    m.reply("*⚠️ Error processing antiword*");
  }
};

export default antiword;
