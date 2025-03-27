import config from '../../config.cjs';
import axios from 'axios';
import yts from 'yt-search';

const song = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['songi', 'song2'];
    if (!validCommands.includes(cmd)) return;

    if (!text) {
      return m.reply(
        `「 ✰ 」ENTER *${cmd === 'song' ? 'AUDIO' : 'VIDEO'}* TITLE\n\n` +
        `*Example:*\n` +
        `${prefix}${cmd} Ryllz - Nemesis`
      );
    }

    // Block direct URLs
    if (text.match(/(http|https|youtube\.com|youtu\.be)/i)) {
      return m.reply(
        `「 ✰ 」INVALID DOWNLOAD\n\n` +
        `Use these commands for URL downloads:\n` +
        `❀ *${prefix}ytmp3* - For Audio\n` +
        `❀ *${prefix}ytmp4* - For Video`
      );
    }

    // Search for videos
    const search = await yts(text);
    if (!search.videos.length) {
      return m.reply('「 ✰ 」NO RESULTS FOUND');
    }

    const video = search.videos[0];
    const resultInfo = 
      `「 ✰ 」 *SEARCH RESULTS:*\n` +
      `> SEARCH: ${text}\n\n` +
      `❀ *TITLE:* ${video.title}\n` +
      `❀ *VIEWS:* ${video.views}\n` +
      `❀ *DURATION:* ${video.duration}\n` +
      `❀ *UPLOADED:* ${video.ago}\n` +
      `❀ *URL:* ${video.url}\n\n` +
      `SENDING YOUR ${cmd === 'song' ? 'AUDIO' : 'VIDEO'}...`;

    // Send thumbnail and info
    await gss.sendMessage(m.from, {
      image: { url: video.thumbnail },
      caption: resultInfo
    }, { quoted: m });

    // Download and send media
    const apiUrl = `https://api-rin-tohsaka.vercel.app/download/yt${cmd === 'song' ? 'mp3' : 'mp4'}?url=${video.url}`;
    const apiResponse = await axios.get(apiUrl);
    const downloadUrl = apiResponse.data.data.download;

    await gss.sendMessage(m.from, {
      document: { 
        url: downloadUrl,
        mimetype: cmd === 'song' ? 'audio/mpeg' : 'video/mp4',
        fileName: `${video.title}.${cmd === 'song' ? 'mp3' : 'mp4'}`
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Song Error:', error);
    m.reply('「 ✰ 」AN ERROR OCCURRED\n\n> ' + error.message);
  }
};

export default song;
