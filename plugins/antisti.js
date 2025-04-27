// antisticker.js
import config from "../config.cjs";

const antistickerDB = new Map(); // { groupJid: boolean }
const warnedUsersDB = new Map(); // { groupJid: Map<userJid, {count: number, lastWarning: Date}> }

const antisticker = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable antisticker
    if (cmd === "antisticker on") {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*\n\n> *Try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Command for admins only*\n\n> *Request admin role*");
      }

      antistickerDB.set(m.from, true);
      warnedUsersDB.set(m.from, new Map());
      return m.reply("*Antisticker is now activated for this group.*\n\n> *Stickers will be auto-deleted*");
    }

    // Disable antisticker
    if (cmd === "antisticker off") {
      if (!m.isGroup) return m.reply("*Command only for groups!*\n\n> *Please try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Only admins can disable antisticker!*\n\n> *Contact group admin*");
      }

      antistickerDB.delete(m.from);
      warnedUsersDB.delete(m.from);
      return m.reply("*Antisticker is now disabled for this group.*\n\n> *Stickers are now allowed*");
    }

    // Sticker detection and deletion
    if (antistickerDB.get(m.from) && m.mtype === 'stickerMessage') {
      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      // Skip if admin or bot owner
      if (senderAdmin || m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') return;

      // 1. Delete the sticker immediately
      await gss.sendMessage(m.from, { delete: m.key });

      // 2. Warning system
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

      // 3. Remove user after 3 violations
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
              text: `🚫 @${m.sender.split('@')[0]} was removed for sending stickers\n> Violations: 3/3`,
              mentions: [m.sender]
            }
          );
          
          // Reset warnings
          warnedUsers.delete(m.sender);
        } catch (removeError) {
          console.error("Removal failed:", removeError);
          return m.reply("*Failed to remove sticker violator!*");
        }
      } else {
        // Send warning
        await gss.sendMessage(
          m.from,
          {
            text: `⚠️ @${m.sender.split('@')[0]} - Stickers not allowed!\n> Warnings: ${userData.count}/3`,
            mentions: [m.sender]
          }
        );
      }
    }
  } catch (error) {
    console.error("Antisticker Error:", error);
    m.reply("*⚠️ An error occurred while processing antisticker*");
  }
};

export default antisticker;
