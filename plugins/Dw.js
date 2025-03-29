import fetch from 'node-fetch';
import config from '../../config.cjs';
import yts from 'yt-search';

// Combined API list with all your endpoints
const apis = {
  audio: [
    (url) => `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(url)}`,
    (url) => `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`,
    (url) => `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(url)}`,
    (url) => `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(url)}&apikey=rahmani-md`,
    (url) => `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(url)}`,
    (url) => `https://api-rin-tohsaka.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`
  ],
  video: [
    (url) => `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(url)}`,
    (url) => `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(url)}`,
    (url) => `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}`
  ]
};

async function fetchDownloadLink(videoUrl, type) {
  const apiList = apis[type] || [];
  
  for (let api of apiList) {
    try {
      const apiUrl = api(videoUrl);
      console.log(`Trying API: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      if (!response.ok) continue;
      
      const data = await response.json();
      
      // Handle different API response formats
      if (data.success && data.result?.download_url) {
        return data.result.download_url;
      } else if (data.url) { // For APIs that return direct URL
        return data.url;
      } else if (data.downloadUrl) { // Alternative response format
        return data.downloadUrl;
      }
    } catch (error) {
      console.error(`API failed: ${error.message}`);
    }
  }
  return null;
}

const play = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'play3') return;

  if (!query) {
    return m.reply("❌ *Please provide a search query!*\nExample: .play2 baby shark");
  }

  try {
    await m.React('⏳');
    const searchResults = await yts(query);
    
    if (!searchResults.videos.length) {
      await m.React('❌');
      return m.reply("❌ *No results found!*");
    }

    const video = searchResults.videos[0];
    const waitMsg = await m.reply(`⏳ *Processing:* ${video.title}\n\nPlease wait...`);

    const caption = `
╭━━━〔 *${config.BOT_NAME}* 〕━━━
┃▸ *Title:* ${video.title}
┃▸ *Duration:* ${video.timestamp}
┃▸ *Views:* ${video.views}
┃▸ *Channel:* ${video.author.name}
╰━━━━━━━━━━━━━━━━━━
📥 *Choose download option:*
1️⃣ Video (MP4)
2️⃣ Audio (MP3)
3️⃣ Video (Document)
4️⃣ Audio (Document)`;

    await gss.sendMessage(
      m.from,
      {
        image: { url: video.thumbnail },
        caption: caption
      },
      { quoted: m }
    );

    // Handle user response
    gss.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || !msg.key.fromMe) return;

      const response = msg.message.conversation || msg.message.extendedTextMessage?.text;
      if (!['1','2','3','4'].includes(response)) return;

      try {
        await m.React('⬇️');
        const type = response === '1' || response === '3' ? 'video' : 'audio';
        const isDocument = response === '3' || response === '4';

        const downloadUrl = await fetchDownloadLink(video.url, type);
        if (!downloadUrl) {
          await m.React('❌');
          return m.reply("❌ *All download methods failed. Please try again later.*");
        }

        const fileExt = type === 'video' ? 'mp4' : 'mp3';
        const fileName = `${video.title}.${fileExt}`.replace(/[^\w\s.-]/gi, '');

        const messageOptions = isDocument 
          ? {
              document: { url: downloadUrl },
              mimetype: type === 'video' ? 'video/mp4' : 'audio/mpeg',
              fileName: fileName,
              caption: `✅ *Download Complete*\n\n${video.title}`
            }
          : {
              [type]: { url: downloadUrl },
              mimetype: type === 'video' ? 'video/mp4' : 'audio/mpeg',
              caption: `✅ *Download Complete*\n\n${video.title}`
            };

        await gss.sendMessage(m.from, messageOptions, { quoted: m });
        await m.React('✅');
        await gss.sendMessage(m.from, { delete: waitMsg.key });

      } catch (error) {
        console.error("Download error:", error);
        await m.React('❌');
        m.reply("❌ *Download failed. Please try again.*");
      }
    });

  } catch (error) {
    console.error("Error:", error);
    await m.React('❌');
    m.reply("❌ *An error occurred. Please try again.*");
    if (waitMsg) await gss.sendMessage(m.from, { delete: waitMsg.key });
  }
};

export default play;
