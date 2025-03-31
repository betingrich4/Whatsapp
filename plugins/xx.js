import axios from 'axios';
import yts from 'yt-search';
import config from '../config.cjs';

const video = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/).filter(Boolean);
  const query = args.join(" ");

  if (!['video3', 'videodoc', 'film', 'mp4'].includes(cmd)) return;

  if (!query) {
    return Matrix.sendMessage(m.from, { text: "❌ Please provide a video name.\nExample: *.video Avengers Endgame*" }, { quoted: m });
  }

  await m.React('🎥');
  await Matrix.sendMessage(m.from, { text: `🎬 Searching for: *${query}*...` }, { quoted: m });

  let videoUrl = query;

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
    const apis = [
      `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${videoUrl}`,
      `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`,
      `https://www.dark-yasiya-api.site/download/ytmp4?url=${videoUrl}`,
      `https://api.giftedtech.web.id/api/download/dlmp4?url=${videoUrl}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/video?url=${videoUrl}`
    ];

    let downloadData;
    for (const api of apis) {
      const { data } = await axios.get(api);
      if (data && data.success) {
        downloadData = data.result;
        break;
      }
    }

    if (!downloadData) {
      return Matrix.sendMessage(m.from, { text: `❌ Failed to retrieve video for "${query}".` }, { quoted: m });
    }

    await Matrix.sendMessage(m.from, {
      video: { url: downloadData.download_url },
      mimetype: 'video/mp4',
      caption: `🎬 *${downloadData.title}*\n⏳ Duration: ${downloadData.duration}`,
      contextInfo: {
        externalAdReply: {
          title: downloadData.title,
          body: "Click to watch",
          mediaType: 1,
          sourceUrl: videoUrl,
          thumbnailUrl: downloadData.thumbnail,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    return Matrix.sendMessage(m.from, { text: `❌ Download failed due to an error: ${error.message || error}` }, { quoted: m });
  }
};

export default video;
