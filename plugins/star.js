import config from '../config.cjs';

const starMessage = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'star') {
      if (!isCreator) {
        return m.reply("*ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ*");
      }

      if (!m.quoted) {
        return m.reply('Reply to the message you want to star');
      }

      await gss.sendMessage(m.from, {
        star: {
          key: m.quoted.key,
          star: true
        }
      });
      return m.reply("Message starred");
    }
  } catch (error) {
    console.error('Error starring message:', error);
    m.reply('An error occurred while trying to star the message.');
  }
};

export default starMessage;
