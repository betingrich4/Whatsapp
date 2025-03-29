import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const play = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "play") return;

  if (!query) {
    return m.reply("*Please provide a song name or YouTube URL*\nExample: .play baby shark");
  }

  try {
    // Search YouTube
    const searchResults = await yts(query);
    if (!searchResults.videos.length) {
      return m.reply(`❌ No results found for "${query}"`);
    }

    const video = searchResults.videos[0];
    const waitMsg = await m.reply(`⏳ Downloading: ${video.title}...`);

    // Try first API
    try {
      const api1Url = `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(video.url)}`;
      const response = await axios.get(api1Url, { responseType: 'arraybuffer' });

      await gss.sendMessage(
        m.from,
        {
          audio: response.data,
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
          caption: `🎵 *${video.title}*\n⬇️ Downloaded via ${config.BOT_NAME}`
        },
        { quoted: m }
      );
    } catch (api1Error) {
      console.log("First API failed, trying backup...");
      
      // Fallback to second API
      const api2Url = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
      const response = await axios.get(api2Url);

      if (!response.data.success) {
        throw new Error("Both APIs failed");
      }

      await gss.sendMessage(
        m.from,
        {
          audio: { url: response.data.result.download_url },
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
          caption: `🎵 *${video.title}*\n⬇️ Downloaded via ${config.BOT_NAME}`
        },
        { quoted: m }
      );
    }

    await gss.sendMessage(m.from, { delete: waitMsg.key });

  } catch (error) {
    console.error("Error:", error);
    m.reply("❌ Failed to download. Please try again later.");
    if (waitMsg) await gss.sendMessage(m.from, { delete: waitMsg.key });
  }
};

export default play;
