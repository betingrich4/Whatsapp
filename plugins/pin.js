import config from '../config.cjs';

const pinMessage = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'pin') {
      if (!isCreator) {
        return m.reply("*ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ*");
      }

      if (!m.quoted) {
        return m.reply('Reply to the message you want to pin');
      }

      const pinOptions = {
        '1': { days: 7, label: "7 days" },
        '2': { days: 1, label: "24 hours" },
        '3': { days: 30, label: "1 month" }
      };

      if (!text) {
        return m.reply(
          `*Pin Duration Options:*\n` +
          `1 = 7 days\n` +
          `2 = 24 hours\n` +
          `3 = 1 month\n\n` +
          `Usage: *${prefix}pin 1-3*`
        );
      }

      if (pinOptions[text]) {
        await gss.pinMessage(m.from, m.quoted.key, pinOptions[text].days * 86400);
        return m.reply(`Pinned for ${pinOptions[text].label}`);
      } else {
        return m.reply(`Invalid option. Use *${prefix}pin 1-3*`);
      }
    }
  } catch (error) {
    console.error('Error pinning message:', error);
    m.reply('An error occurred while trying to pin the message.');
  }
};

export default pinMessage;
