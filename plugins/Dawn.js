import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const play = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play") {
    if (!args) {
      return m.reply("*Please provide a song name or YouTube URL*\n\nExample: .play baby shark");
    }

    try {
      // Check if it's a YouTube URL
      const isYtUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(args);
      
      let videoInfo;
      if (isYtUrl) {
        // Extract video ID from URL
        const videoId = args.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|youtu\.be\/)([^"&?\/\s]{11})/)[1];
        const searchResults = await yts({ videoId });
        videoInfo = searchResults.videos[0];
      } else {
        // Search YouTube
        const searchResults = await yts(args);
        if (!searchResults.videos.length) {
          return m.reply(`❌ No results found for "${args}"`);
        }
        videoInfo = searchResults.videos[0];
      }

      const processingMsg = await m.reply(`⏳ *Processing:* ${videoInfo.title}\n\nPlease wait...`);

      // Prepare both API endpoints
      const audioApiUrl = `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(videoInfo.url)}`;
      const videoApiUrl = `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(videoInfo.url)}`;
      const backupAudioApiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoInfo.url)}`;

      // Create interactive buttons
      const buttons = [
        {
          quickReplyButton: {
            displayText: "🎧 Download Audio",
            id: `audio_${videoInfo.videoId}`
          }
        },
        {
          quickReplyButton: {
            displayText: "🎥 Download Video",
            id: `video_${videoInfo.videoId}`
          }
        }
      ];

      await gss.sendMessage(
        m.from,
        {
          text: `*${videoInfo.title}*\n\n` +
                `⏱ Duration: ${videoInfo.timestamp}\n` +
                `👀 Views: ${videoInfo.views}\n` +
                `👤 Channel: ${videoInfo.author.name}\n\n` +
                `Choose download option:`,
          footer: config.BOT_NAME,
          buttons: buttons,
          headerType: 1,
          viewOnce: true
        },
        { quoted: m }
      );

      await gss.sendMessage(m.from, { delete: processingMsg.key });

    } catch (error) {
      console.error("Search Error:", error);
      m.reply("❌ Error processing your request. Please try again.");
    }
  }
};

// Handle button responses
play.before = async (m, gss) => {
  const selectedId = m.message?.buttonsResponseMessage?.selectedButtonId || 
                    m.message?.templateButtonReplyMessage?.selectedId;

  if (!selectedId) return;

  try {
    const [type, videoId] = selectedId.split('_');
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let apiUrl, fileType, mimeType;

    if (type === 'audio') {
      apiUrl = `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(videoUrl)}`;
      fileType = 'audio';
      mimeType = 'audio/mpeg';
    } else if (type === 'video') {
      apiUrl = `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(videoUrl)}`;
      fileType = 'video';
      mimeType = 'video/mp4';
    } else {
      return;
    }

    const waitMsg = await m.reply(`⏳ Downloading ${type}...`);

    try {
      // Try primary API first
      const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      await gss.sendMessage(
        m.from,
        {
          [fileType]: data,
          mimetype: mimeType,
          caption: `✅ Download complete!\n\nPowered by ${config.BOT_NAME}`
        },
        { quoted: m }
      );

    } catch (primaryError) {
      console.error("Primary API failed, trying backup:", primaryError);
      
      // Fallback to backup API for audio
      if (type === 'audio') {
        try {
          const backupResponse = await axios.get(
            `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
          );

          if (backupResponse.data?.success) {
            await gss.sendMessage(
              m.from,
              {
                audio: { url: backupResponse.data.result.download_url },
                mimetype: 'audio/mpeg',
                caption: `✅ Download complete!\n\nPowered by ${config.BOT_NAME}`
              },
              { quoted: m }
            );
          } else {
            throw new Error("Backup API failed");
          }
        } catch (backupError) {
          console.error("Backup API failed:", backupError);
          await m.reply("❌ All download methods failed. Please try again later.");
        }
      } else {
        await m.reply("❌ Video download failed. Please try again later.");
      }
    }

    await gss.sendMessage(m.from, { delete: waitMsg.key });

  } catch (error) {
    console.error("Button Error:", error);
    m.reply("❌ Error processing your download request.");
  }
};

export default play;
