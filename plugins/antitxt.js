import config from '../config.cjs';

// Newsletter Configuration (internal use only, not shown to users)
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

  // Function to create quoted message options
  const getMessageOptions = () => ({
    contextInfo: {
      forwardingScore: newsletterContext.forwardingScore,
      isForwarded: newsletterContext.isForwarded,
      forwardedNewsletterMessageInfo: newsletterContext.forwardedNewsletterMessageInfo
    }
  });

  // Function to block the user (you can expand this according to your bot's needs)
  const blockUser = async (jid) => {
    try {
      await Matrix.updateBlockStatus(jid, 'block');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  // --- Commands Handler ---
  if (cmd === 'antitext' && text === 'on') {
    warningTracker.clear();
    return Matrix.sendMessage(m.from, {
      text: `🛡️ Anti-text protection enabled.`,
      ...getMessageOptions()
    });
  }

  if (cmd === 'antitext' && text === 'off') {
    warningTracker.clear();
    return Matrix.sendMessage(m.from, {
      text: `🛡️ Anti-text protection disabled.`,
      ...getMessageOptions()
    });
  }

  if (cmd === 'antitext' && text === 'allow') {
    allowedUsers.add(m.sender);
    return Matrix.sendMessage(m.from, {
      text: `✅ User whitelisted.`,
      ...getMessageOptions()
    });
  }

  if (cmd === 'antitext' && text === 'disallow') {
    allowedUsers.delete(m.sender);
    return Matrix.sendMessage(m.from, {
      text: `⛔ User removed from whitelist.`,
      ...getMessageOptions()
    });
  }

  // --- Normal Message Processing ---
  // Ignore commands themselves
  if (m.body.startsWith(prefix)) return;

  // Check if user is whitelisted
  if (allowedUsers.has(m.sender)) return;

  // Warn users for normal text messages
  const warnings = warningTracker.get(m.sender) || 0;

  if (warnings === 0) {
    warningTracker.set(m.sender, 1);
    return Matrix.sendMessage(m.from, {
      text: `⚠️ Warning: Don't message unnecessarily.\nNext message will result in blocking.`,
      ...getMessageOptions()
    });
  } else {
    await Matrix.sendMessage(m.from, {
      text: `⛔ You have been blocked for spamming.`,
      ...getMessageOptions()
    });
    await blockUser(m.sender);
    warningTracker.delete(m.sender);
  }
};

export default antitextCommand;
