import axios from 'axios';
import yts from 'yt-search';
import config from '../config.cjs';

const video = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/).filter(Boolean);
  const query = args.join(" ");

  if (!['song1', 'play1', 'vid', 'mp4'].includes(cmd)) return;

  if (!query) {
    return Matrix.sendMessage(m.from, { text: "❌ Please provide a video name or a YouTube link.\nExample:\n*.video Alone*\n*.video https://youtu.be/example*" }, { quoted: m });
  }

  await m.React('🎬');
  await Matrix.sendMessage(m.from, { text: `🎬 Searching for: *${query}*...` }, { quoted: m });

  let videoUrl = query;

  // Check if input is a YouTube link; if not, search
  if (!query.includes("youtube.com") && !query.includes("youtu.be")) {
    try {
      const searchResults = await yts(query);
      if (!searchResults.videos || searchResults.videos.length === 0) {
        return Matrix.sendMessage(m.from, { text: `❌ No results found for "${query}".` }, { quoted: m });
      }
      videoUrl = searchResults.videos[0].url;
    } catch (err) {
      console.error(err);
      return Matrix.sendMessage(m.from, { text: "❌ Error searching for the video. Try again later." }, { quoted: m });
    }
  }

  try {
    // Call API to fetch video details
    const apiUrl = 'https://www.dark-yasiya-api.site/download/ytmp3?url=';
    const { data } = await axios.get(apiUrl);

    if (!data.success) {
      return Matrix.sendMessage(m.from, { text: `❌ Failed to download video for "${query}".` }, { quoted: m });
    }

    const { title, download_url } = data.result;

    await Matrix.sendMessage(m.from, {
      video: { url: download_url },
      mimetype: 'video/mp4',
      caption: title,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363299029326322@newsletter',
          newsletterName: "ᴅᴇᴍᴏɴ sʟᴀʏᴇʀ",
          serverMessageId: 143
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error("Error in video command:", error);
    Matrix.sendMessage(m.from, { text: "❌ An error occurred while processing your request." }, { quoted: m });
  }
};

export default video;
