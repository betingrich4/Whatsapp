import config from '../config.cjs';

// Store warnings for each user
const linkWarnings = new Map();

const antilink = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Check if the message contains a link
  const linkRegex = /https?:\/\/[^\s]+/i;
  const containsLink = linkRegex.test(m.body);

  if (containsLink && m.isGroup) {
    const sender = m.sender;
    const groupMetadata = await gss.groupMetadata(m.from);
    const isAdmin = groupMetadata.participants.find(participant => participant.id === sender)?.admin === 'admin';

    // Skip if the sender is an admin
    if (isAdmin) return;

    // Delete the message containing the link
    try {
      await gss.sendMessage(m.from, { delete: m.key });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }

    // Get the number of warnings for this user
    const warnings = linkWarnings.get(sender) || 0;

    if (warnings < 1) {
      // Warn the user
      linkWarnings.set(sender, warnings + 1);
      await gss.sendMessage(m.from, {
        text: `*Warning ${warnings + 1}/1: Please do not send links in this group. Next violation will result in removal.*`,
        mentions: [sender],
      }, { quoted: m });
    } else {
      // Remove the user after 1 warning
      try {
        await gss.groupParticipantsUpdate(m.from, [sender], 'remove');
        await gss.sendMessage(m.from, {
          text: `*@${sender.split('@')[0]} has been removed for sending links.*`,
          mentions: [sender],
        }, { quoted: m });
        linkWarnings.delete(sender); // Reset warnings after removal
      } catch (error) {
        console.error('Failed to remove user:', error);
        await gss.sendMessage(m.from, {
          text: `Failed to remove @${sender.split('@')[0]}. Please check permissions.*`,
          mentions: [sender],
        }, { quoted: m });
      }
    }
  }
};

export default antilink;
