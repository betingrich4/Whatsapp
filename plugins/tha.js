import axios from "axios";
import yts from "yt-search";
import config from '../../config.cjs';

const play2 = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play2") {
    if (!args) return m.reply("Please provide a YouTube link or song name\nExample: .play2 Moye Moye\nOr: .play2 https://youtu.be/xyz");

    try {
      m.reply("🔍 Processing your request...");

      let videoUrl;
      
      // Check if input is a YouTube URL
      if (args.match(/(youtube\.com|youtu\.be)/)) {
        videoUrl = args;
      } else {
        // Search YouTube if input is text
        const searchResults = await yts(args);
        if (!searchResults.videos.length) return m.reply("❌ No results found");
        videoUrl = searchResults.videos[0].url;
      }

      const apiUrl = `https://home.lazacktech.biz.id/api/ytdl?url=${encodeURIComponent(videoUrl)}`;
      
      // Make a request to fetch the download URL
      const { data } = await axios.get(apiUrl);
      
      if (!data.success) return m.reply("❌ Failed to download audio");

      // Extract details from the search result or API response (assuming they are available)
      const title = data.result.title || "Untitled";  // You may need to fetch the title from the response
      const duration = data.result.duration || "Unknown";  // Assuming duration is available
      const thumbnail = data.result.thumbnail || "https://default_thumbnail_url.com"; // Default or dynamic thumbnail URL

      // Create the newsletter message payload
      const messagePayload = {
        audio: { url: data.result.download_link},
        mimetype: "audio/mpeg",
        caption: `*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟᴏʀᴅ ᴊᴏᴇʟ*`,
        thumbnail: thumbnail,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363317462952356@newsletter',
            newsletterName: "ᴊᴏᴇʟ xᴍᴅ ᴡᴀ ᴄʜᴀɴɴᴇʟ",
            serverMessageId: -1,
          },
          externalAdReply: {
            title: "ᴊᴏᴇʟ xmᴅ ʙᴏᴛ  ʙʏ ʟᴏʀᴅ ᴊᴏᴇʟ",
            body: "ᴘʟᴀʏɪɴɢ ɴᴏᴡ ↻ ◁ II ▷ ↺
",
            thumbnailUrl: `https://raw.githubusercontent.com/joeljamestech2/JOEL-XMD/refs/heads/main/mydata/media/joelXbot.jpg`,
            sourceUrl: 'https://whatsapp.com/channel/0029Vak2PevK0IBh2pKJPp2K',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      };

      // Send the audio with the newsletter context
      await gss.sendMessage(
        m.from,
        messagePayload,
        { quoted: m }
      );

    } catch (error) {
      console.error(error);
      m.reply("An error occurred. Please try  play2");
    }
  }
};

export default play2;
