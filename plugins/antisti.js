import config from "../config.cjs";

const antistickerDB = new Map(); // { groupJid: boolean }
const warnedUsersDB = new Map(); // { groupJid: Map<userJid, {count: number, lastWarning: Date}> }

const antisticker = async (m, gss) => {
  try {
    const cmd = m.body?.toLowerCase().trim();

    // Command handling (ON/OFF)
    if (cmd === "antisticker on" || cmd === "antisticker off") {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Command for admins only*");
      }

      if (cmd === "antisticker on") {
        antistickerDB.set(m.from, true);
        warnedUsersDB.set(m.from, new Map());
        return m.reply("*Antisticker activated*\n> Stickers will be auto-deleted for non-admins");
      } else {
        antistickerDB.delete(m.from);
        warnedUsersDB.delete(m.from);
        return m.reply("*Antisticker disabled*\n> Stickers are now allowed");
      }
    }

    // Sticker handling logic
    if (m.mtype === 'stickerMessage') {
      // PM handling - only delete stickers sent TO you
      if (!m.isGroup) {
        if (m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') return; // Allow owner to send stickers
        if (m.sender === m.from) { // Someone sent you a sticker
          await gss.sendMessage(m.from, { delete: m.key });
          return m.reply("*Stickers not allowed in PM*");
        }
        return;
      }

      // Group handling
      if (antistickerDB.get(m.from)) {
        const groupMetadata = await gss.groupMetadata(m.from);
        const participant = groupMetadata.participants.find(p => p.id === m.sender);
        
        // Skip if sender is admin/owner or message is from the bot itself
        if (participant?.admin || 
            m.sender === config.OWNER_NUMBER + '@s.whatsapp.net' || 
            m.sender === gss.user.id) {
          return;
        }

        // Delete the sticker
        await gss.sendMessage(m.from, { delete: m.key });

        // Warning system
        const warnedUsers = warnedUsersDB.get(m.from) || new Map();
        const userData = warnedUsers.get(m.sender) || { count: 0, lastWarning: 0 };

        // Reset counter if last warning was >24h ago
        if (Date.now() - userData.lastWarning > 86400000) {
          userData.count = 0;
        }

        userData.count++;
        userData.lastWarning = Date.now();
        warnedUsers.set(m.sender, userData);
        warnedUsersDB.set(m.from, warnedUsers);

        // Remove after 3 violations
        if (userData.count >= 3) {
          try {
            const botAdmin = groupMetadata.participants.find(p => p.id === gss.user.id)?.admin;
            if (!botAdmin) {
              return m.reply("*I need admin to remove members!*");
            }

            await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
            await gss.sendMessage(
              m.from, 
              {
                text: `🚫 @${m.sender.split('@')[0]} removed for stickers\n> Violations: 3/3`,
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
              text: `⚠️ @${m.sender.split('@')[0]} - No stickers!\n> Warnings: ${userData.count}/3`,
              mentions: [m.sender]
            }
          );
        }
      }
    }
  } catch (error) {
    console.error("Antisticker Error:", error);
    m.reply("*Error processing antisticker*");
  }
};

export default antisticker;
