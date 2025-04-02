function hi() {
  console.log("Hello World!");
}
hi();
import '../../config.cjs';
import _0x11e682 from 'yt-search';
const play = async (_0x1e8557, _0x569c5d) => {
  const _0xe1e344 = _0x1e8557.body.trim().toLowerCase();
  if (_0xe1e344.startsWith("play") || _0xe1e344.startsWith("video")) {
    const _0x2020f8 = _0xe1e344.replace(/^(play|video)\s*/, '').trim();
    if (!_0x2020f8) {
      return _0x1e8557.reply("❌ *Please provide a search query!*");
    }
    await _0x1e8557.React('⏳');
    try {
      const _0x2b1e05 = await _0x11e682(_0x2020f8);
      if (!_0x2b1e05.videos.length) {
        return _0x1e8557.reply("❌ *No results found!*");
      }
      const _0x3bb569 = _0x2b1e05.videos[0x0];
      const _0x23a855 = "\n\n╭━━━〔 *Demon Slayer Downloader* 〕━━━\n┃▸ *Title:* " + _0x3bb569.title + "\n┃▸ *Duration:* " + _0x3bb569.timestamp + "\n┃▸ *Views:* " + _0x3bb569.views + "\n┃▸ *Channel:* " + _0x3bb569.author.name + "\n╰━━━━━━━━━━━━━━━━━━\n📥 *Downloading automatically...*";
      await _0x569c5d.sendMessage(_0x1e8557.from, {
        'image': {
          'url': _0x3bb569.thumbnail
        },
        'caption': _0x23a855
      }, {
        'quoted': _0x1e8557
      });
      const _0x199a71 = encodeURIComponent(_0x3bb569.url);
      const _0x2ea8a2 = ["https://apis.giftedtech.web.id/api/download/dlmp4?apikey=gifted&url=" + _0x199a71, "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + _0x199a71, "https://www.dark-yasiya-api.site/download/ytmp4?url=" + _0x199a71, "https://api.giftedtech.web.id/api/download/dlmp4?url=" + _0x199a71 + '&apikey=gifted-md'];
      const _0x388714 = ['https://apis.davidcyriltech.my.id/download/ytmp3?url=' + _0x199a71, "https://apis.davidcyriltech.my.id/download/ytmp3?url=" + _0x199a71, "https://apis.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=" + _0x199a71];
      const _0x105808 = _0xe1e344.startsWith("video") ? _0x2ea8a2 : _0x388714;
      const _0x1ae320 = _0xe1e344.startsWith("video") ? "video" : 'audio';
      const _0x4d41ef = _0xe1e344.startsWith("video") ? 'video/mp4' : "audio/mpeg";
      const _0x369faa = _0xe1e344.startsWith("video") ? "📥 *Downloaded in Video Format*" : "📥 *Downloaded in Audio Format*";
      let _0x4792db = null;
      for (const _0x5e2f70 of _0x105808) {
        try {
          const _0x381522 = await fetch(_0x5e2f70);
          const _0x4b366a = await _0x381522.json();
          if (_0x4b366a.success && _0x4b366a.result.download_url) {
            _0x4792db = _0x4b366a.result.download_url;
            break;
          }
        } catch (_0x149638) {
          console.error("❌ API failed: " + _0x5e2f70);
        }
      }
      if (!_0x4792db) {
        return _0x1e8557.reply("❌ *All download sources failed. Please try again later.*");
      }
      const _0x403f8f = {
        [_0x1ae320]: {
          'url': _0x4792db
        },
        'mimetype': _0x4d41ef,
        'caption': _0x369faa
      };
      await _0x569c5d.sendMessage(_0x1e8557.from, _0x403f8f, {
        'quoted': _0x1e8557
      });
    } catch (_0x53de36) {
      console.error('Error:', _0x53de36);
      return _0x1e8557.reply("❌ *An error occurred while processing your request.*");
    }
  }
};
export default play;
