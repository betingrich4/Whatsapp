import config from '../config.cjs';

// In-memory storage (consider using a database for persistence)
const warningTracker = new Map(); // Tracks warnings per user: { userId: warningCount }
const allowedUsers = new Set(); // Users exempt from anti-text

const antitextCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Function to silently block a user
  const blockUser = async (userId) => {
    try {
      await Matrix.updateBlockStatus(userId, 'block');
      console.log(`Blocked user: ${userId}`);
      // Remove from tracking after blocking
      warningTracker.delete(userId);
      allowedUsers.delete(userId);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  // Command handler
  if (cmd === 'antitext') {
    if (!isCreator) return m.reply("*ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ*");
    
    const [subCmd, targetUser] = text.split(' ');

    switch (subCmd) {
      case 'on':
        config.ANTI_TEXT = true;
        await Matrix.sendMessage(m.from, { text: "Anti-Text protection is now enabled." }, { quoted: m });
        break;
      
      case 'off':
        config.ANTI_TEXT = false;
        await Matrix.sendMessage(m.from, { text: "Anti-Text protection is now disabled." }, { quoted: m });
        break;
      
      case 'allow':
        if (!targetUser) {
          await Matrix.sendMessage(m.from, { text: "Please provide a user to allow.\nUsage: `antitext allow [@user]`" }, { quoted: m });
          return;
        }
        
        // Extract user ID from mention or raw input
        let userId;
        if (m.mentionedJid && m.mentionedJid.length > 0) {
          userId = m.mentionedJid[0];
        } else {
          // Handle raw number input (add @s.whatsapp.net if not present)
          userId = targetUser.includes('@') ? targetUser : `${targetUser}@s.whatsapp.net`;
        }
        
        allowedUsers.add(userId);
        warningTracker.delete(userId); // Reset their warnings
        await Matrix.sendMessage(m.from, { text: `User ${userId} is now allowed to message freely.` }, { quoted: m });
        break;
      
      case 'status':
        const status = config.ANTI_TEXT ? 'ENABLED' : 'DISABLED';
        const allowedList = allowedUsers.size > 0 
          ? `\nAllowed Users:\n${Array.from(allowedUsers).join('\n')}`
          : '\nNo users are currently allowed.';
        await Matrix.sendMessage(m.from, { 
          text: `Anti-Text Status: ${status}${allowedList}` 
        }, { quoted: m });
        break;
      
      default:
        const helpText = `Anti-Text Management:
        
- \`antitext on\`: Enable protection
- \`antitext off\`: Disable protection
- \`antitext allow @user\`: Allow specific user
- \`antitext status\`: Show current status`;
        await Matrix.sendMessage(m.from, { text: helpText }, { quoted: m });
    }
    return;
  }

  // Anti-text protection logic
  if (config.ANTI_TEXT && !isCreator && !allowedUsers.has(m.sender)) {
    const userId = m.sender;
    const currentWarnings = warningTracker.get(userId) || 0;

    if (currentWarnings < 2) {
      // Send warning
      const warningMessage = currentWarnings === 0 
        ? "Please do not message the owner unnecessarily. This is your first warning."
        : "Final warning! Stop messaging the owner or you will be blocked.";
      
      await Matrix.sendMessage(m.from, { 
        text: warningMessage,
        mentions: [userId]
      }, { quoted: m });
      
      // Increment warning count
      warningTracker.set(userId, currentWarnings + 1);
    } else {
      // Block user after 2 warnings
      await blockUser(userId);
      await Matrix.sendMessage(m.from, { 
        text: "You have been blocked for excessive messaging.",
        mentions: [userId]
      });
    }
  }
};

export default antitextCommand;
