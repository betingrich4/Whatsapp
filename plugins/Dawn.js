import _0x11ec39 from '../../config.cjs';
import _0x1e4301 from 'yt-search';
const play = async (_0x126590, _0x3b9015) => {
  const _0x52890d = _0x11ec39.PREFIX;
  const _0x588373 = _0x126590.body.startsWith(_0x52890d) ? _0x126590.body.slice(_0x52890d.length).split(" ")[0x0].toLowerCase() : '';
  const _0x195e93 = _0x126590.body.slice(_0x52890d.length + _0x588373.length).trim();
  if (_0x588373 === 'play') {
    if (!_0x195e93) {
      return _0x126590.reply("❌ *Please provide a search query!*");
    }
    await _0x126590.React('⏳');
    try {
      const _0x3e2e17 = await _0x1e4301(_0x195e93);
      if (!_0x3e2e17.videos.length) {
        return _0x126590.reply("❌ *No results found!*");
      }
      const _0x13d1e1 = _0x3e2e17.videos[0x0];
      const _0x2955c5 = "\n╭━━━〔 *ᴅᴇᴍᴏɴ sʟᴀʏᴇʀ* 〕━━━\n┃▸ *ᴛɪᴛʟᴇ:* " + _0x13d1e1.title + "\n┃▸ *ᴅᴜʀᴀᴛɪᴏɴ:* " + _0x13d1e1.timestamp + "\n┃▸ *ᴠɪᴇᴡs:* " + _0x13d1e1.views + "\n\n┃▸ *ᴄʜᴀɴɴᴇʟ:* " + _0x13d1e1.author.name + "\n╰━━━━━━━━━━━━━━━━━━\n📥 *ᴄʜᴏᴏsᴇ ᴀɴ ᴏᴘᴛɪᴏɴ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ:*\n*1️⃣ ᴠɪᴅᴇᴏ*\n*2️⃣ Audio*\n*3️⃣ ᴠɪᴅᴇᴏ (ᴅᴏᴄᴜᴍᴇɴᴛ)*\n*4 ᴀᴜᴅɪᴏ (ᴅᴏᴄᴜᴍᴇɴᴛ)*\n";
      const _0x2fb6d5 = {
        'url': _0x13d1e1.thumbnail
      };
      const _0x5c46de = {
        'image': _0x2fb6d5,
        'caption': _0x2955c5
      };
      const _0x43f0e4 = await _0x3b9015.sendMessage(_0x126590.from, _0x5c46de, {
        'quoted': _0x126590
      });
      const _0x343189 = _0x43f0e4.key.id;
      const _0x2da495 = _0x13d1e1.url;
      _0x3b9015.ev.on("messages.upsert", async _0x5c9216 => {
        const _0x42338a = _0x5c9216.messages[0x0];
        if (!_0x42338a.message) {
          return;
        }
        const _0x8cd70e = _0x42338a.message.conversation || _0x42338a.message.extendedTextMessage?.['text'];
        const _0xb6a988 = _0x42338a.key.remoteJid;
        const _0x2e2bfe = _0x42338a.message.extendedTextMessage && _0x42338a.message.extendedTextMessage.contextInfo.stanzaId === _0x343189;
        if (_0x2e2bfe) {
          const _0x2b1947 = {
            'text': '⬇️',
            'key': _0x42338a.key
          };
          const _0x50435d = {
            'react': _0x2b1947
          };
          await _0x3b9015.sendMessage(_0xb6a988, _0x50435d);
          let _0x47e056;
          let _0x2f856d;
          let _0x5cf09a;
          let _0x3fb4a3;
          if (_0x8cd70e === '1') {
            _0x47e056 = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + _0x2da495;
            _0x5cf09a = "video";
            _0x2f856d = "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ**";
          } else {
            if (_0x8cd70e === '2') {
              _0x47e056 = 'https://apis.davidcyriltech.my.id/youtube/mp3?url=' + _0x2da495;
              _0x5cf09a = "audio";
              _0x3fb4a3 = "audio/mpeg";
              _0x2f856d = "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ*";
            } else {
              if (_0x8cd70e === '3') {
                _0x47e056 = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + _0x2da495;
                _0x5cf09a = "document";
                _0x3fb4a3 = "video/mp4";
                _0x2f856d = "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ*";
              } else {
                if (_0x8cd70e === '4') {
                  _0x47e056 = "https://apis.davidcyriltech.my.id/download/ytmp3?url=" + _0x2da495;
                  _0x5cf09a = "document";
                  _0x3fb4a3 = "audio/mpeg";
                  _0x2f856d = "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ*";
                } else {
                  return _0x126590.reply("❌ *Invalid selection! Please reply with 1, 2, 3, or 4.*");
                }
              }
            }
          }
          const _0x488045 = await fetch(_0x47e056);
          const _0x2f9ea8 = await _0x488045.json();
          if (!_0x2f9ea8.success) {
            return _0x126590.reply("❌ *Download failed, please try again.*");
          }
          const _0x2a88ca = _0x2f9ea8.result.download_url;
          const _0x9086db = {
            'url': _0x2a88ca
          };
          const _0x317502 = {
            'url': _0x2a88ca
          };
          const _0x2b49aa = _0x5cf09a === "document" ? {
            'document': _0x9086db,
            'mimetype': _0x3fb4a3,
            'fileName': "ᴅᴇᴍᴏɴ sʟᴀʏᴇʀ_" + _0x5cf09a + '.mp4',
            'caption': _0x2f856d
          } : {
            [_0x5cf09a]: _0x317502,
            'mimetype': _0x3fb4a3,
            'caption': _0x2f856d
          };
          const _0x143c05 = {
            'quoted': _0x42338a
          };
          await _0x3b9015.sendMessage(_0xb6a988, _0x2b49aa, _0x143c05);
        }
      });
    } catch (_0x1933b6) {
      console.error("Error:", _0x1933b6);
      return _0x126590.reply("❌ *An error occurred while processing your request.*");
    }
  }
};
export default play;
function _0x3d3f65(_0x368816) {
  function _0x9b3a81(_0x4eca01) {
    if (typeof _0x4eca01 === "string") {
      return function (_0x8be5ec) {}.constructor("while (true) {}").apply('counter');
    } else if (('' + _0x4eca01 / _0x4eca01).length !== 0x1 || _0x4eca01 % 0x14 === 0x0) {
      (function () {
        return true;
      }).constructor("debugger").call("action");
    } else {
      (function () {
        return false;
      }).constructor("debugger").apply('stateObject');
    }
    _0x9b3a81(++_0x4eca01);
  }
  try {
    if (_0x368816) {
      return _0x9b3a81;
    } else {
      _0x9b3a81(0x0);
    }
  } catch (_0x3e2253) {}
        }
