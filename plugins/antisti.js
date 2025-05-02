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

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("Only admins can control antisticker!");
      }

      if (cmd === "antisticker on") {
        antistickerDB.set(m.from, true);
        return m.reply("🔇 Silent antisticker activated\n> All non-owner stickers will be deleted");
      } else {
        antistickerDB.delete(m.from);
        return m.reply("Antisticker deactivated");
      }
    }

    // Sticker handling - GROUPS ONLY
    if (m.isGroup && m.mtype === 'stickerMessage' && antistickerDB.get(m.from)) {
      // NEVER DELETE OWNER'S STICKERS
      if (m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') {
        return; 
      }

      // Delete all other stickers (members + admins)
      await gss.sendMessage(m.from, { delete: m.key });
    }
  } catch (error) {
    console.error("Antisticker Error:", error);
  }
};

export default antisticker;
