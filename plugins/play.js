import config from '../../config.cjs';
import axios from 'axios';

const play = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'pla') return;

    if (!text) {
      return m.reply(`Please provide a search query\nUsage: *${prefix}play <song name>*`);
    }

    // Show searching indicator
    await m.reply('*Searching...*');

    const apiUrl = `https://ochinpo-helper.hf.space/yt?query=${encodeURIComponent(text)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data || !response.data.url) {
      return m.reply('❌ No results found for your query');
    }

    const { title, url, thumbnail, duration } = response.data;

    // Send the audio with metadata
    await gss.sendMessage(m.from, {
      audio: { url: url },
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: title,
          body: `Duration: ${duration}`,
          thumbnailUrl: thumbnail,
          mediaType: 2,
          mediaUrl: url,
          sourceUrl: url
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Play Error:', error);
    m.reply('❌ An error occurred while processing your request');
  }
};

export default play;
