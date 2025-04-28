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

  // Helper: Newsletter info
  const showNewsletterInfo = () => {
    return `\nNewsletter: ${newsletterContext.forwardedNewsletterMessageInfo.newsletterName}`;
  };

  // Helper: Options to include newsletter context
  const getMessageOptions = () => {
    return { contextInfo: newsletterContext };
  };

  // Helper: Block a user
  const blockUser = async (userId) => {
    try {
      await Matrix.updateBlockStatus(userId, 'block');
      console.log(`Blocked user: ${userId}`);
      warningTracker.delete(userId);
      return true;
    } catch (error) {
      console.error("Error blocking user:", error);
      return false;
    }
  };

  // Handle commands
  if (cmd === 'antitext') {
    if (!isCreator) return m.reply("*Owner only command*");

    if (text === 'allow' && m.quoted) {
      const targetUser = m.quoted.sender;
      allowedUsers.add(targetUser);
      warningTracker.delete(targetUser);
      return Matrix.sendMessage(m.from, {
        text: `✅ User whitelisted${showNewsletterInfo()}`,
        ...getMessageOptions()
      }, { quoted: m });
    }

    switch (text) {
      case 'on':
        config.ANTI_TEXT = true;
        return Matrix.sendMessage(m.from, {
          text: `🛡️ Auto-protection enabled\nI'll warn then block messaging users${showNewsletterInfo()}`,
          ...getMessageOptions()
        });

      case 'off':
        config.ANTI_TEXT = false;
        return Matrix.sendMessage(m.from, {
          text: `🔓 Auto-protection disabled${showNewsletterInfo()}`,
          ...getMessageOptions()
        });

      case 'status':
        const status = config.ANTI_TEXT ? '🟢 ACTIVE' : '🔴 INACTIVE';
        const warnedCount = warningTracker.size;
        const allowedCount = allowedUsers.size;

        return Matrix.sendMessage(m.from, {
          text: `🛡️ Protection Status: ${status}\n\n⚠️ Warned Users: ${warnedCount}\n✅ Allowed Users: ${allowedCount}${showNewsletterInfo()}`,
          ...getMessageOptions()
        });

      case 'clear':
        warningTracker.clear();
        return Matrix.sendMessage(m.from, {
          text: `🧹 Cleared all warning records${showNewsletterInfo()}`,
          ...getMessageOptions()
        });

      default:
        return Matrix.sendMessage(m.from, {
          text: `🛡️ Anti-Text Commands:\n\n• ${prefix}antitext on - Enable\n• ${prefix}antitext off - Disable\n• ${prefix}antitext status - Show status\n• ${prefix}antitext clear - Reset warnings\n• Reply with "${prefix}antitext allow" to whitelist${showNewsletterInfo()}`,
          ...getMessageOptions()
        });
    }
  }

  // Auto-protection logic
  if (config.ANTI_TEXT && !isCreator && !allowedUsers.has(m.sender)) {
    const userId = m.sender;

    if (warningTracker.has(userId)) {
      const blocked = await blockUser(userId);
      await Matrix.sendMessage(m.from, {
        text: `🚫 You've been blocked for messaging after warning${showNewsletterInfo()}`,
        ...getMessageOptions()
      });

      try {
        await Matrix.sendMessage(m.from, { delete: m.key });
      } catch (error) {
        console.error("Couldn't delete message:", error);
      }
    } else {
      warningTracker.set(userId, true);
      await Matrix.sendMessage(m.from, {
        text: `⚠️ *Warning*: Don't message unnecessarily\nNext message will result in blocking${showNewsletterInfo()}`,
        ...getMessageOptions()
      }, { quoted: m });
    }
  }
};

export default antitextCommand;
