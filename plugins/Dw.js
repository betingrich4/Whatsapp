import fetch from 'node-fetch';
import _0x11ec39 from '../../config.cjs';
import _0x1e4301 from 'yt-search';

const apis = [
  (url) => `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}`,
  (url) => `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`,
  (url) => `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(url)}`,
  (url) => `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(url)}&apikey=rahmani-md`,
  (url) => `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(url)}`
];

async function fetchDownloadLink(videoUrl) {
  for (let api of apis) {
    try {
      const response = await fetch(api(videoUrl));
      const data = await response.json();
      
      if (data.success && data.result?.download_url) {
        return data.result.download_url; // Return the first working download link
      }
    } catch (error) {
      console.error(`API failed: ${api(videoUrl)}`, error);
    }
  }
  return null; // Return null if all APIs fail
}

const play = async (_0x126590, _0x3b9015) => {
  const _0x52890d = _0x11ec39.PREFIX;
  const _0x588373 = _0x126590.body.startsWith(_0x52890d) 
    ? _0x126590.body.slice(_0x52890d.length).split(" ")[0].toLowerCase() 
    : '';
  
  const _0x195e93 = _0x126590.body.slice(_0x52890d.length + _0x588373.length).trim();

  if (_0x588373 === 'play2') {
    if (!_0x195e93) return _0x126590.reply("❌ *Please provide a search query!*");

    await _0x126590.React('⏳');

    try {
      const _0x3e2e17 = await _0x1e4301(_0x195e93);
      if (!_0x3e2e17.videos.length) return _0x126590.reply("❌ *No results found!*");

      const _0x13d1e1 = _0x3e2e17.videos[0];
      const videoUrl = _0x13d1e1.url;

      const _0x2955c5 = `\n╭━━━〔 *ᴅᴇᴍᴏɴ sʟᴀʏᴇʀ* 〕━━━
┃▸ *ᴛɪᴛʟᴇ:* ${_0x13d1e1.title}
┃▸ *ᴅᴜʀᴀᴛɪᴏɴ:* ${_0x13d1e1.timestamp}
┃▸ *ᴠɪᴇᴡs:* ${_0x13d1e1.views}
┃▸ *ᴄʜᴀɴɴᴇʟ:* ${_0x13d1e1.author.name}
╰━━━━━━━━━━━━━━━━━━
📥 *ᴄʜᴏᴏsᴇ ᴀɴ ᴏᴘᴛɪᴏɴ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ:*
*1️⃣ ᴠɪᴅᴇᴏ*
*2️⃣ Audio*
*3️⃣ ᴠɪᴅᴇᴏ (ᴅᴏᴄᴜᴍᴇɴᴛ)*
*4 ᴀᴜᴅɪᴏ (ᴅᴏᴄᴜᴍᴇɴᴛ)*`;

      const _0x5c46de = {
        image: { url: _0x13d1e1.thumbnail },
        caption: _0x2955c5
      };

      const _0x43f0e4 = await _0x3b9015.sendMessage(_0x126590.from, _0x5c46de, { quoted: _0x126590 });
      const _0x343189 = _0x43f0e4.key.id;

      _0x3b9015.ev.on("messages.upsert", async (_0x5c9216) => {
        const _0x42338a = _0x5c9216.messages[0];
        if (!_0x42338a.message) return;

        const _0x8cd70e = _0x42338a.message.conversation || _0x42338a.message.extendedTextMessage?.text;
        const _0xb6a988 = _0x42338a.key.remoteJid;
        const _0x2e2bfe = _0x42338a.message.extendedTextMessage && _0x42338a.message.extendedTextMessage.contextInfo.stanzaId === _0x343189;

        if (_0x2e2bfe) {
          await _0x3b9015.sendMessage(_0xb6a988, { react: { text: '⬇️', key: _0x42338a.key } });

          let fileType, mimeType;
          if (_0x8cd70e === '1' || _0x8cd70e === '3') {
            fileType = _0x8cd70e === '1' ? "video" : "document";
            mimeType = "video/mp4";
          } else if (_0x8cd70e === '2' || _0x8cd70e === '4') {
            fileType = _0x8cd70e === '2' ? "audio" : "document";
            mimeType = "audio/mpeg";
          } else {
            return _0x126590.reply("❌ *Invalid selection! Please reply with 1, 2, 3, or 4.*");
          }

          const downloadUrl = await fetchDownloadLink(videoUrl);
          if (!downloadUrl) return _0x126590.reply("❌ *Download failed, please try again.*");

          const messageOptions = fileType === "document"
            ? { document: { url: downloadUrl }, mimetype: mimeType, fileName: `Demon_Slayer_${fileType}.mp4`, caption: "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ*" }
            : { [fileType]: { url: downloadUrl }, mimetype: mimeType, caption: "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ*" };

          await _0x3b9015.sendMessage(_0xb6a988, messageOptions, { quoted: _0x42338a });
        }
      });
    } catch (error) {
      console.error("Error:", error);
      return _0x126590.reply("❌ *An error occurred while processing your request.*");
    }
  }
};

export default play;
