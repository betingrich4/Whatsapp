import config from '../config.cjs';
import { warnUser, resetWarnings } from '../lib/warnUser.js';

const antibot = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Check if the message is from a bot (e.g., starts with a prefix)
  const isBotCommand = m.body.startsWith(prefix) && !m.key.fromMe;

  if (isBotCommand && m.isGroup) {
    const sender = m.sender;
    const groupMetadata = await gss.groupMetadata(m.from);
    const isAdmin = groupMetadata.participants.find(participant => participant.id === sender)?.admin === 'admin';

    // Skip if the sender is an admin
    if (isAdmin) return;

    const warnings = warnUser(sender);

    if (warnings < 2) {
      // Warn the user
      await gss.sendMessage(m.from, {
        text: `⚠️ Warning ${warnings}/2: Please do not use other bots in this group. Next violation will result in removal.`,
        mentions: [sender],
      }, { quoted: m });
    } else {
      // Remove the user after 2 warnings
      try {
        await gss.groupParticipantsUpdate(m.from, [sender], 'remove');
        await gss.sendMessage(m.from, {
          text: `🚫 @${sender.split('@')[0]} has been removed for using other bots.`,
          mentions: [sender],
        }, { quoted: m });
        resetWarnings(sender); // Reset warnings after removal
      } catch (error) {
        console.error('Failed to remove user:', error);
        await gss.sendMessage(m.from, {
          text: `❌ Failed to remove @${sender.split('@')[0]}. Please check bot permissions.`,
          mentions: [sender],
        }, { quoted: m });
      }
    }
  }
};

export default antibot;
