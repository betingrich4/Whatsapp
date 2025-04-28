import config from '../config.cjs';

// Storage for warnings and allowed users
const warningTracker = new Map(); // { userId: warned (true/false) }
const allowedUsers = new Set();   // Users who are exempt

const antitextCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Helper function to display JID
  const formatJidInfo = (jid) => {
    return `\n\n┌──────────────\n│ JID: ${jid}\n└──────────────`;
  };

  // Function to block a user silently
  const blockUser = async (userId) => {
    try {
      await Matrix.updateBlockStatus(userId, 'block');
      console.log(`Automatically blocked user: ${userId}`);
      warningTracker.delete(userId); // Clear their warning
      return true;
    } catch (error) {
      console.error("Error blocking user:", error);
      return false;
    }
  };

  // Command handler
  if (cmd === 'antitext') {
    if (!isCreator) return m.reply("*Owner only command*");

    // Handle allow command via reply
    if (text === 'allow' && m.quoted) {
      const targetUser = m.quoted.sender;
      allowedUsers.add(targetUser);
      warningTracker.delete(targetUser);
      return m.reply(
        `✅ User whitelisted${formatJidInfo(targetUser)}`
      );
    }

    // Main commands
    switch (text) {
      case 'on':
        config.ANTI_TEXT = true;
        return m.reply(
          `🛡️ Auto-protection enabled\n` +
          `I'll warn then block messaging users` +
          formatJidInfo(m.from)
        );

      case 'off':
        config.ANTI_TEXT = false;
        return m.reply(
          `🔓 Auto-protection disabled` +
          formatJidInfo(m.from)
        );

      case 'status':
        const status = config.ANTI_TEXT ? '🟢 ACTIVE' : '🔴 INACTIVE';
        const warnedUsers = Array.from(warningTracker.keys()).join('\n') || 'None';
        const allowedList = Array.from(allowedUsers).join('\n') || 'None';
        
        return m.reply(
          `🛡️ Protection Status: ${status}\n\n` +
          `⚠️ Warned Users:\n${warnedUsers}\n\n` +
          `✅ Allowed Users:\n${allowedList}` +
          formatJidInfo(m.from)
        );

      case 'clear':
        warningTracker.clear();
        return m.reply(
          `🧹 Cleared all warning records` +
          formatJidInfo(m.from)
        );

      default:
        return m.reply(
          `🛡️ Anti-Text Commands:\n\n` +
          `• ${prefix}antitext on - Enable auto-protection\n` +
          `• ${prefix}antitext off - Disable protection\n` +
          `• ${prefix}antitext status - Show status\n` +
          `• ${prefix}antitext clear - Reset warnings\n` +
          `• Reply to message with "${prefix}antitext allow" to whitelist` +
          formatJidInfo(m.from)
        );
    }
  }

  // AUTO-PROTECTION LOGIC (only when enabled)
  if (config.ANTI_TEXT && !isCreator && !allowedUsers.has(m.sender)) {
    const userId = m.sender;

    if (warningTracker.has(userId)) {
      // User was already warned - BLOCK THEM
      const blocked = await blockUser(userId);
      await m.reply(
        `🚫 You've been blocked for messaging after warning` +
        formatJidInfo(userId)
      );
      
      // Delete the offending message
      try {
        await Matrix.sendMessage(m.from, { delete: m.key });
      } catch (e) {
        console.error("Couldn't delete message:", e);
      }
    } else {
      // First offense - WARN THEM
      warningTracker.set(userId, true);
      await m.reply(
        `⚠️ *Warning*: Please don't message unnecessarily\n` +
        `Next message will result in automatic blocking` +
        formatJidInfo(userId)
      );
    }
  }
};

export default antitextCommand;
