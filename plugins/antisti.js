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
        return m.reply("🔕 Silent antisticker activated\n> Stickers from others will be auto-deleted");
      } else {
        antistickerDB.delete(m.from);
        return m.reply("Antisticker deactivated");
      }
    }

    // Sticker handling
    if (m.mtype === 'stickerMessage') {
      // PM Handling: Only delete stickers sent TO you
      if (!m.isGroup) {
        if (m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') return; // Allow owner to send
        if (m.sender === m.from) { // Someone sent you a sticker
          await gss.sendMessage(m.from, { delete: m.key }); // Silent delete
        }
        return;
      }

      // Group Handling
      if (antistickerDB.get(m.from)) {
        // NEVER DELETE THESE SENDERS' STICKERS:
        const protectedSenders = [
          config.OWNER_NUMBER + '@s.whatsapp.net', // You (owner)
          gss.user.id,                             // The bot itself
        ];

        if (protectedSenders.includes(m.sender)) {
          console.log("Protected sender - sticker not deleted");
          return;
        }

        // Delete all other stickers (members + other admins)
        await gss.sendMessage(m.from, { delete: m.key }); // Silent delete
      }
    }
  } catch (error) {
    console.error("Antisticker Error:", error);
  }
};

export default antisticker;
