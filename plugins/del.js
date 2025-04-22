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
        await gss.sendMessage(m.from, { delete: m.key });
        return;
      }

      if (!m.quoted) {
        await gss.sendMessage(m.from, { delete: m.key });
        return;
      }

      // Delete both the quoted message and the command silently
      await Promise.all([
        gss.sendMessage(m.from, { 
          delete: {
            remoteJid: m.from,
            id: m.quoted.key.id,
            participant: m.quoted.key.participant || m.quoted.key.remoteJid
          }
        }),
        gss.sendMessage(m.from, { 
          delete: {
            remoteJid: m.from,
            id: m.key.id,
            participant: m.key.participant || m.key.remoteJid
          }
        })
      ]);
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    // No error message will be sent
  }
};

export default deleteMessage;
