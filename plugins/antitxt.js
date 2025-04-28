import config from '../config.cjs';

// Newsletter Configuration
const newsletterContext = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363299029326322@newsletter',
    newsletterName: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
    serverMessageId: 143
  }
};

// Storage for warnings and allowed users
const warningTracker = new Map();
const allowedUsers = new Set();

const antitextCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Function to delete messages
  const deleteMessage = async (key) => {
    try {
      await Matrix.sendMessage(m.from, { delete: key });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Function to block users
  const blockUser = async (jid) => {
    try {
      await Matrix.updateBlockStatus(jid, 'block');
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  };

  // Message options with newsletter context
  const getMessageOptions = () => ({
    contextInfo: newsletterContext
  });

  // --- Command Handling ---
  if (cmd === 'antitext') {
    if (!isCreator) {
      await deleteMessage(m.key);
      return m.reply("*Owner only command*");
    }

    // Delete the command message
    await deleteMessage(m.key);

    switch (text) {
      case 'on':
        config.ANTI_TEXT = true;
        warningTracker.clear();
        return Matrix.sendMessage(m.from, {
          text: `🛡️ Anti-text protection enabled`,
          ...getMessageOptions()
        });

      case 'off':
        config.ANTI_TEXT = false;
        warningTracker.clear();
        return Matrix.sendMessage(m.from, {
          text: `🔓 Anti-text protection disabled`,
          ...getMessageOptions()
        });

      case 'allow':
        if (!m.quoted) return m.reply("Reply to a message to whitelist user");
        allowedUsers.add(m.quoted.sender);
        warningTracker.delete(m.quoted.sender);
        return Matrix.sendMessage(m.from, {
          text: `✅ User whitelisted`,
          ...getMessageOptions()
        });

      case 'disallow':
        if (!m.quoted) return m.reply("Reply to a message to remove from whitelist");
        allowedUsers.delete(m.quoted.sender);
        return Matrix.sendMessage(m.from, {
          text: `⛔ User removed from whitelist`,
          ...getMessageOptions()
        });

      case 'clear':
        warningTracker.clear();
        return Matrix.sendMessage(m.from, {
          text: `🧹 Cleared all warnings`,
          ...getMessageOptions()
        });

      default:
        return Matrix.sendMessage(m.from, {
          text: `🛡️ Anti-Text Commands:\n\n• ${prefix}antitext on - Enable protection\n• ${prefix}antitext off - Disable\n• ${prefix}antitext allow - Whitelist (reply to message)\n• ${prefix}antitext disallow - Remove from whitelist\n• ${prefix}antitext clear - Reset warnings`,
          ...getMessageOptions()
        });
    }
  }

  // --- Message Processing ---
  if (!config.ANTI_TEXT || isCreator || allowedUsers.has(m.sender)) {
    return; // Skip if protection is off or user is exempt
  }

  const warnings = warningTracker.get(m.sender) || 0;

  if (warnings === 0) {
    // First warning
    warningTracker.set(m.sender, 1);
    return Matrix.sendMessage(m.from, {
      text: `⚠️ Warning: Please don't message unnecessarily\nNext message will result in blocking`,
      ...getMessageOptions()
    });
  } else {
    // Block after second message
    await blockUser(m.sender);
    await Matrix.sendMessage(m.from, {
      text: `⛔ You've been blocked for excessive messaging`,
      ...getMessageOptions()
    });
    await deleteMessage(m.key); // Delete the offending message
    warningTracker.delete(m.sender);
  }
};

export default antitextCommand;
