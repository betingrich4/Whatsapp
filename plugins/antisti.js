import config from "../config.cjs";

const antistickerDB = new Map(); // { groupJid: boolean }

const antisticker = async (m, gss) => {
  try {
    const cmd = m.body?.toLowerCase().trim();

    // Command handling (ON/OFF)
    if (cmd === "antisticker on" || cmd === "antisticker off") {
      if (!m.isGroup) return m.reply("This command works only in groups!");
      
      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Only admins can control antisticker!*");
      }

      if (cmd === "antisticker on") {
        antistickerDB.set(m.from, true);
        return m.reply("*Silent antisticker activated*\n> Stickers from others will be auto-deleted");
      } else {
        antistickerDB.delete(m.from);
        return m.reply("Antisticker deactivated");
      }
    }

    // Sticker handling
    if (m.mtype === 'stickerMessage') {
      // DM Handling: Delete stickers sent TO the user, but not their own
      if (!m.isGroup) {
        if (m.sender === m.key.participant || m.sender === m.from) {
          return; // Don't delete user's own stickers in DMs
        }
        // Delete stickers sent to the user by others
        await gss.sendMessage(m.from, { delete: m.key });
        return;
      }

      // Group Handling: Only delete others' stickers if antisticker is ON and user is admin
      if (antistickerDB.get(m.from)) {
        const groupMetadata = await gss.groupMetadata(m.from);
        const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;
        const botUserAdmin = groupMetadata.participants.find(p => p.id === gss.user.id)?.admin;

        // Don't delete the user's stickers or the bot's stickers
        if (m.sender === gss.user.id || m.sender === m.key.participant) {
          return;
        }

        // Only delete if the bot's user is an admin
        if (botUserAdmin) {
          await gss.sendMessage(m.from, { delete: m.key });
        }
      }
    }
  } catch (error) {
    console.error("Antisticker Error:", error);
  }
};

export default antisticker;
