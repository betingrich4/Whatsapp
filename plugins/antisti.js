import config from "../config.cjs";

const antistickerDB = new Map(); // Temporary in-memory storage

const antisticker = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable antisticker
    if (cmd === "antisticker on") {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*\n\n> *Try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Command for admins only*\n\n> *Request admin role*");
      }

      antistickerDB.set(m.from, true);
      return m.reply("*Antisticker is now activated for this group.*\n\n> *Stickers will be auto-deleted*");
    }

    // Disable antisticker
    if (cmd === "antisticker off") {
      if (!m.isGroup) return m.reply("*Command only for groups!*\n\n> *Please try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Only admins can disable antisticker!*\n\n> *Smile in pain*");
      }

      antistickerDB.delete(m.from);
      return m.reply("*Antisticker is now disabled for this group.*\n\n> *Stickers are now allowed*");
    }

    // Auto-detect and delete stickers
    if (antistickerDB.get(m.from)) {
      if (m.mtype === 'stickerMessage') {
        // Get group metadata
        const groupMetadata = await gss.groupMetadata(m.from);
        const participants = groupMetadata.participants;

        // Check if the sender is an admin
        const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

        if (senderAdmin) {
          // If the sender is an admin, do not take any action
          return;
        }

        // Delete the sticker
        await gss.sendMessage(m.from, { delete: m.key });

        // Warn the user
        await m.reply(`*Stickers are not allowed in this group!*\n\n> *This is your first warning.*`);

        // Track warned users
        const warnedUsers = antistickerDB.get(m.from + "_warned") || new Set();
        if (warnedUsers.has(m.sender)) {
          // Remove the user if they repeat the violation
          await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
          return m.reply(`*${m.sender.split('@')[0]} has been removed for sending stickers.*`);
        } else {
          warnedUsers.add(m.sender);
          antistickerDB.set(m.from + "_warned", warnedUsers);
        }
      }
    }
  } catch (error) {
    console.error("Error in Antisticker:", error);
    m.reply("*⚠️ An error occurred while processing Antisticker.*\n\n> *Please try again later*");
  }
};

export default antisticker;
