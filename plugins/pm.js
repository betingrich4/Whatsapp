import config from '../../config.cjs';

const pmBlockerHandler = async (m, gss) => {
  // Ignore messages sent by the bot itself
  if (m.isBaileys && m.fromMe) return true;

  // Allow owner and real owner messages
  if (gss.isOwner || gss.isROwner) return false;

  // Ignore group messages
  if (m.isGroup) return false;

  // Check allowlist
  const allowlist = global.allowed || [];
  const senderNumber = m.sender.split('@')[0];
  if (allowlist.includes(senderNumber)) return false;

  // PM Blocker logic
  const botSettings = global.db.data.settings[gss.user.jid] || {};
  if (botSettings.pmblocker) {
    try {
      // Send warning message
      await gss.sendMessage(m.chat, {
        text: `*Hello @${senderNumber}, messaging the bot privately is currently disabled.*\n\n` +
              `You have been blocked from using the bot.\n` +
              `Contact the owner if this was a mistake.\n\n` +
              `*Owner:* ${config.OWNER_NAME || 'Unknown'}`,
        mentions: [m.sender]
      });

      // Block the user
      await gss.updateBlockStatus(m.chat, 'block');
      
      // Log the block action
      console.log(`Blocked user ${senderNumber} via PM Blocker`);
      
      return true;
    } catch (error) {
      console.error('PM Blocker Error:', error);
      return true; // Still block even if message fails
    }
  }

  return false;
};

// Set handler to run before processing messages
pmBlockerHandler.before = true;

export default pmBlockerHandler;
