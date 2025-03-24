import config from '../config.cjs';

const forwardMessage = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'forward') {
      if (!isCreator) {
        return m.reply("*ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ*");
      }

      if (!m.quoted) {
        return m.reply('Reply to the message you want to forward');
      }

      if (!text) {
        return m.reply(`Usage: *${prefix}forward 1234567890*\n(Include country code)`);
      }

      const number = text.trim().replace(/[^0-9]/g, '');
      if (!number) {
        return m.reply('❌ Invalid phone number format');
      }

      await gss.sendMessage(`${number}@s.whatsapp.net`, { 
        forward: m.quoted.key 
      });
      
      return m.reply(`Message forwarded to ${number}`);
    }
  } catch (error) {
    console.error('Error forwarding message:', error);
    m.reply('An error occurred while trying to forward the message.');
  }
};

export default forwardMessage;
