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
      // Check if in group
      if (m.isGroup) {
        // Delete only for me in groups
        await Matrix.sendMessage(m.from, { 
          delete: {
            id: m.key.id,
            participant: m.sender,
            remoteJid: m.from,
            fromMe: false
          }
        });
      } 
      // Check if in private chat and I'm admin
      else {
        // Try to delete for everyone first
        try {
          await Matrix.sendMessage(m.from, { 
            delete: m.key 
          });
        } catch (error) {
          // If delete for everyone fails (not admin), delete just for me
          await Matrix.sendMessage(m.from, { 
            delete: {
              id: m.key.id,
              participant: m.sender,
              remoteJid: m.from,
              fromMe: false
            }
          });
        }
        
        // Send warning in private chats
        await Matrix.sendMessage(m.from, { 
          text: `*Mmmh*`,
          mentions: [m.sender] 
        });
      }
    } catch (error) {
      console.error("Error deleting sticker:", error);
    }
  }
};

export default antistickerCommand;
