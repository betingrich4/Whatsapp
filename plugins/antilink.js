import config from "../config.cjs";

const antilinkDB = new Map(); // { groupJid: boolean }
const warnedUsersDB = new Map(); // { groupJid: Map<userJid, warningCount> }

const antiLink = async (m, gss) => {
  try {
    const cmd = m.body?.toLowerCase().trim();

    // Command handling
    if (cmd === "antilink on" || cmd === "antilink off") {
      if (!m.isGroup) return m.reply("This command works only in groups!");
      
      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("Only admins can control antilink!");
      }

      if (cmd === "antilink on") {
        antilinkDB.set(m.from, true);
        warnedUsersDB.set(m.from, new Map());
        return m.reply("🔗 Anti-Link activated\n> Links will be automatically handled");
      } else {
        antilinkDB.delete(m.from);
        warnedUsersDB.delete(m.from);
        return m.reply("Anti-Link deactivated");
      }
    }

    // Link detection
    if (antilinkDB.get(m.from) && m.body) {
      const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(wa\.me\/[^\s]+)/gi;
      if (linkRegex.test(m.body)) {
        const groupMetadata = await gss.groupMetadata(m.from);
        const participant = groupMetadata.participants.find(p => p.id === m.sender);
        
        // Always delete the message first
        await gss.sendMessage(m.from, { delete: m.key });

        // Protected senders (bot owner and bot itself)
        const protectedSenders = [
          config.OWNER_NUMBER + '@s.whatsapp.net',
          gss.user.id
        ];

        if (protectedSenders.includes(m.sender)) return;

        // Check if sender is admin
        const isAdmin = participant?.admin;

        if (isAdmin) {
          // For admins: Just delete, no warnings
          return;
        }

        // For non-admins: Warning system
        const warnedUsers = warnedUsersDB.get(m.from) || new Map();
        const warningCount = (warnedUsers.get(m.sender) || 0) + 1;
        warnedUsers.set(m.sender, warningCount);
        warnedUsersDB.set(m.from, warnedUsers);

        // Remove after 3 violations
        if (warningCount >= 3) {
          try {
            const botAdmin = groupMetadata.participants.find(p => p.id === gss.user.id)?.admin;
            if (!botAdmin) {
              await gss.sendMessage(
                m.from,
                { text: `⚠️ @${m.sender.split('@')[0]} reached 3 violations but I need admin to remove` },
                { mentions: [m.sender] }
              );
              return;
            }
            
            await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
            await gss.sendMessage(
              m.from, 
              {
                text: `🚫 @${m.sender.split('@')[0]} removed for sending links\n> Violations: 3/3`,
                mentions: [m.sender]
              }
            );
            warnedUsers.delete(m.sender);
          } catch (error) {
            console.error("Removal error:", error);
          }
        } else {
          await gss.sendMessage(
            m.from,
            {
              text: `⚠️ @${m.sender.split('@')[0]} - Links not allowed!\n> Warnings: ${warningCount}/3`,
              mentions: [m.sender]
            }
          );
        }
      }
    }
  } catch (error) {
    console.error("AntiLink Error:", error);
  }
};

export default antiLink;
