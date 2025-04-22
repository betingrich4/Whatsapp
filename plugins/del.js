import config from '../../config.cjs';

const deleteMessage = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefixMatch = m.body.match(/^[\\/!#.]/);
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    const validCommands = ['del', 'delete'];

    if (validCommands.includes(cmd)) {
      if (!isCreator) {
        await gss.sendMessage(m.from, { delete: m.key }); // Delete the unauthorized command
        return m.reply("*OWNER COMMAND*");
      }

      if (!m.quoted) {
        await gss.sendMessage(m.from, { delete: m.key }); // Delete the invalid command
        return m.reply('Reply to the message you want to delete');
      }

      // Delete the target message
      const targetKey = {
        remoteJid: m.from,
        id: m.quoted.key.id,
        participant: m.quoted.key.participant || m.quoted.key.remoteJid
      };

      // Delete the command message
      const commandKey = {
        remoteJid: m.from,
        id: m.key.id,
        participant: m.key.participant || m.key.remoteJid
      };

      // Perform deletions
      await Promise.all([
        gss.sendMessage(m.from, { delete: targetKey }),
        gss.sendMessage(m.from, { delete: commandKey })
      ]);

      // Send confirmation (this will remain visible)
      await gss.sendMessage(
        m.from, 
        { text: 'Message deleted successfully' },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    try {
      await gss.sendMessage(m.from, { delete: m.key }); // Try to delete the failed command
    } catch (e) {
      console.error('Failed to delete command:', e);
    }
    m.reply('An error occurred while trying to delete the message.');
  }
};

export default deleteMessage;
