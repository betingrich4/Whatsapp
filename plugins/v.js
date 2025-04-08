const {
  cmd
} = require('../command');
const yts = require('yt-search');
const path = require('path');
const axios = require("axios");
const fs = require('fs');

// don't remove creadit by awaisxd

cmd({
  'pattern': 'video',
  'react': '🎬',
  'desc': "Download video from YouTube by searching for keywords.",
  'category': "media",
  'use': ".video4 <keywords>",
  'filename': __filename
}, async (_0x24c315, _0x3a6d67, _0x1fe974, {
  from: _0x767c92,
  args: _0x55bbc3,
  reply: _0x5b120e
}) => {
  try {
    const _0x4d3a95 = _0x55bbc3.join(" ");
    if (!_0x4d3a95) {
      return _0x5b120e("*Please provide a video title or keywords to search for.*");
    }
    _0x5b120e("*_VIDEO FOUND UPLOADING WAIT..._*");
    const _0x2110e1 = await yts(_0x4d3a95);
    if (!_0x2110e1.videos || _0x2110e1.videos.length === 0x0) {
      return _0x5b120e("❌ No results found for \"" + _0x4d3a95 + "\".");
    }
    const _0x4ed4c1 = _0x2110e1.videos[0x0];
    const _0x2ef690 = _0x4ed4c1.url;
    const _0x23109c = "https://api.davidcyriltech.my.id/download/ytmp4?url=" + _0x2ef690;
    const _0x567fa0 = await axios.get(_0x23109c);
    if (!_0x567fa0.data.success) {
      return _0x5b120e("❌ Failed to fetch video for \"" + _0x4d3a95 + "\".");
    }
    const {
      title: _0x390c02,
      download_url: _0x519f84
    } = _0x567fa0.data.result;
    await _0x24c315.sendMessage(_0x767c92, {
      'video': {
        'url': _0x519f84
      },
      'mimetype': 'video/mp4',
      'caption': _0x390c02
    }, {
      'quoted': _0x3a6d67
    });
  } catch (_0x5e8828) {
    console.error(_0x5e8828);
    _0x5b120e("❌ An error occurred while processing your request.");
  }
});
