import config from '../config.cjs';

const antistickerCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  // Command handler
  if (cmd === 'antisticker') {
    if (!isCreator) return m.reply("*Owner only command*");
    
    const subCmd = m.body.slice(prefix.length + cmd.length).trim().toLowerCase();
    let response;

    switch (subCmd) {
      case 'on':
        config.ANTI_STICKER = true;
        response = "🛡️ Anti-Sticker protection enabled\nStickers will be automatically deleted";
        break;
      
      case 'off':
        config.ANTI_STICKER = false;
        response = "🔓 Anti-Sticker protection disabled";
        break;
      
      case 'status':
        response = `Anti-Sticker Status: ${config.ANTI_STICKER ? '🟢 ACTIVE' : '🔴 INACTIVE'}`;
        break;
      
      default:
        response = `Anti-Sticker Commands:\n\n• ${prefix}antisticker on - Enable protection\n• ${prefix}antisticker off - Disable\n• ${prefix}antisticker status - Show status`;
    }

    return Matrix.sendMessage(m.from, { text: response }, { quoted: m });
  }

  // Sticker detection and deletion
  if (config.ANTI_STICKER && m.message?.stickerMessage) {
    try {
      // Delete the sticker message
      await Matrix.sendMessage(m.from, {
        delete: {
          id: m.key.id,
          participant: m.sender,
          remoteJid: m.from,
          fromMe: false
        }
      });

      // Send warning (only in private chats)
      if (!m.isGroup) {
        await Matrix.sendMessage(m.from, { 
          text: `⚠️ Stickers are not allowed here`,
          mentions: [m.sender] 
        });
      }
    } catch (error) {
      console.error("Error handling sticker:", error);
      // Fallback: Try alternative deletion method if first fails
      try {
        await Matrix.sendMessage(m.from, { delete: m.key });
      } catch (fallbackError) {
        console.error("Fallback deletion failed:", fallbackError);
      }
    }
  }
};

export default antistickerCommand;
