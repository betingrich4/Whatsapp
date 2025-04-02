import config from '../../config.cjs';

const textToImage = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'texttoimg') return;

    if (!text) {
      return m.reply(
        `❌ *Please enter text to generate image*\n\n` +
        `*Usage:* ${prefix}texttoimg <your prompt>\n` +
        `*Example:* ${prefix}texttoimg cute cat playing with ball`
      );
    }

    // Show generating indicator
    const waitMsg = await m.reply('Generating your image...\nFollow me on Instagram: instagram.com');

    const apiUrl = `https://jazxcode.biz.id/ai/texttoimg?prompt=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const json = await response.json();
    if (!json.status || !json.images?.length) {
      throw new Error('No images generated');
    }

    // Delete wait message
    await gss.sendMessage(m.from, { delete: waitMsg.key });

    // Send all generated images
    for (const [index, imageUrl] of json.images.entries()) {
      await gss.sendMessage(m.from, {
        image: { url: imageUrl },
        caption: index === 0 ? `*Generated Image for:*\n"${text}"` : '',
        footer: config.BOT_NAME
      }, { quoted: m });
    }

  } catch (error) {
    console.error('TextToImg Error:', error);
    m.reply(`❌ Failed to generate image\nError: ${error.message}`);
    
    // Clean up wait message if exists
    if (waitMsg) {
      await gss.sendMessage(m.from, { delete: waitMsg.key });
    }
  }
};

export default textToImage;
