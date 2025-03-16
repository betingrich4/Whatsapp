import _0x374dd9 from 'yt-search';
import _0x3e57ae from 'wasitech';
import _0x863fd3 from '@whiskeysockets/baileys';
const {
  generateWAMessageFromContent,
  proto,
  prepareWAMessageMedia
} = _0x863fd3;
const searchResultsMap = new Map();
let searchIndex = 0x1;
const playcommand = async (_0x1aa06f, _0x19de68) => {
  let _0x40aabe;
  const _0x3582bf = _0x1aa06f?.["message"]?.["templateButtonReplyMessage"]?.['selectedId'];
  const _0x175b97 = _0x1aa06f?.["message"]?.["interactiveResponseMessage"];
  if (_0x175b97) {
    const _0x827280 = _0x175b97.nativeFlowResponseMessage?.["paramsJson"];
    if (_0x827280) {
      const _0x411e0f = JSON.parse(_0x827280);
      _0x40aabe = _0x411e0f.id;
    }
  }
  const _0x3a9183 = _0x40aabe || _0x3582bf;
  const _0x3c651d = _0x1aa06f.body.match(/^[\\/!#.]/);
  const _0x228054 = _0x3c651d ? _0x3c651d[0x0] : '/';
  const _0x5c6ba0 = _0x1aa06f.body.startsWith(_0x228054) ? _0x1aa06f.body.slice(_0x228054.length).split(" ")[0x0].toLowerCase() : '';
  const _0x35acfd = _0x1aa06f.body.slice(_0x228054.length + _0x5c6ba0.length).trim();
  const _0x15237f = ["play"];
  if (_0x15237f.includes(_0x5c6ba0)) {
    if (!_0x35acfd) {
      return _0x1aa06f.reply("*Please provide a search query*");
    }
    try {
      await _0x1aa06f.React('🕘');
      const _0x51ccb9 = await _0x374dd9(_0x35acfd);
      const _0xf17648 = _0x51ccb9.videos.slice(0x0, 0x5);
      if (_0xf17648.length === 0x0) {
        _0x1aa06f.reply("No results found.");
        await _0x1aa06f.React('❌');
        return;
      }
      _0xf17648.forEach((_0x2bfbef, _0x27ade0) => {
        const _0x500f57 = searchIndex + _0x27ade0;
        searchResultsMap.set(_0x500f57, _0x2bfbef);
      });
      const _0x23f76e = searchResultsMap.get(searchIndex);
      const _0x17632a = [{
        'name': "quick_reply",
        'buttonParamsJson': JSON.stringify({
          'display_text': "🎧 AUDIO",
          'id': "media_audio_" + searchIndex
        })
      }, {
        'name': "quick_reply",
        'buttonParamsJson': JSON.stringify({
          'display_text': "🎥 VIDEO",
          'id': 'media_video_' + searchIndex
        })
      }, {
        'name': "quick_reply",
        'buttonParamsJson': JSON.stringify({
          'display_text': "🎵 AUDIO DOCUMENT",
          'id': "media_audiodoc_" + searchIndex
        })
      }, {
        'name': "quick_reply",
        'buttonParamsJson': JSON.stringify({
          'display_text': "🎦 VIDEO DOCUMENT",
          'id': "media_videodoc_" + searchIndex
        })
      }, {
        'name': 'quick_reply',
        'buttonParamsJson': JSON.stringify({
          'display_text': "⏩ NEXT",
          'id': "next_" + (searchIndex + 0x1)
        })
      }];
      const _0x2a1b65 = _0x23f76e.thumbnail;
      const _0x48a6c4 = "https://www.youtube.com/watch?v=" + _0x23f76e.videoId;
      const _0x33dead = generateWAMessageFromContent(_0x1aa06f.from, {
        'viewOnceMessage': {
          'message': {
            'messageContextInfo': {
              'deviceListMetadata': {},
              'deviceListMetadataVersion': 0x2
            },
            'interactiveMessage': proto.Message.InteractiveMessage.create({
              'body': proto.Message.InteractiveMessage.Body.create({
                'text': "*HANSAMAL-MD YOUTUBE SEARCH*\n\n> *TITLE:* " + _0x23f76e.title + "\n> *AUTHOR:* " + _0x23f76e.author.name + "\n> *VIEWS:* " + _0x23f76e.views + "\n> *DURATION:* " + _0x23f76e.timestamp + "\n> *YTLINK:* " + _0x48a6c4 + "\n"
              }),
              'footer': proto.Message.InteractiveMessage.Footer.create({
                'text': "© Powered By MERCEDES"
              }),
              'header': proto.Message.InteractiveMessage.Header.create({
                ...(await prepareWAMessageMedia({
                  'image': {
                    'url': _0x2a1b65
                  }
                }, {
                  'upload': _0x19de68.waUploadToServer
                })),
                'title': '',
                'gifPlayback': true,
                'subtitle': '',
                'hasMediaAttachment': false
              }),
              'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.create({
                'buttons': _0x17632a
              }),
              'contextInfo': {
                'mentionedJid': [_0x1aa06f.sender],
                'forwardingScore': 0x270f,
                'isForwarded': true
              }
            })
          }
        }
      }, {});
      await _0x19de68.relayMessage(_0x33dead.key.remoteJid, _0x33dead.message, {
        'messageId': _0x33dead.key.id
      });
      await _0x1aa06f.React('✅');
      searchIndex += 0x1;
    } catch (_0x111fec) {
      console.error("Error processing your request:", _0x111fec);
      _0x1aa06f.reply("Error processing your request.");
      await _0x1aa06f.React('❌');
    }
  } else {
    if (_0x3a9183) {
      if (_0x3a9183.startsWith("next_")) {
        const _0x1fdebb = parseInt(_0x3a9183.replace("next_", ''));
        const _0x3110c2 = searchResultsMap.get(_0x1fdebb);
        const _0x29678f = [{
          'name': "quick_reply",
          'buttonParamsJson': JSON.stringify({
            'display_text': "🎧 AUDIO",
            'id': 'media_audio_' + _0x1fdebb
          })
        }, {
          'name': "quick_reply",
          'buttonParamsJson': JSON.stringify({
            'display_text': "🎥 VIDEO",
            'id': "media_video_" + _0x1fdebb
          })
        }, {
          'name': "quick_reply",
          'buttonParamsJson': JSON.stringify({
            'display_text': "🎵 AUDIO DOCUMENT",
            'id': "media_audiodoc_" + _0x1fdebb
          })
        }, {
          'name': "quick_reply",
          'buttonParamsJson': JSON.stringify({
            'display_text': "🎦 VIDEO DOCUMENT",
            'id': "media_videodoc_" + _0x1fdebb
          })
        }, {
          'name': "quick_reply",
          'buttonParamsJson': JSON.stringify({
            'display_text': "⏩ NEXT",
            'id': "next_" + (_0x1fdebb + 0x1)
          })
        }];
        const _0x36675b = _0x3110c2.thumbnail;
        const _0x5ae0df = "https://www.youtube.com/watch?v=" + _0x3110c2.videoId;
        const _0x30ec7b = generateWAMessageFromContent(_0x1aa06f.from, {
          'viewOnceMessage': {
            'message': {
              'messageContextInfo': {
                'deviceListMetadata': {},
                'deviceListMetadataVersion': 0x2
              },
              'interactiveMessage': proto.Message.InteractiveMessage.create({
                'body': proto.Message.InteractiveMessage.Body.create({
                  'text': "*MERCEDES YOUTUBE SEARCH*\n\n> *🔍TITLE:* " + _0x3110c2.title + "\n> *AUTHOR:* " + _0x3110c2.author.name + "\n> *VIEWS:* " + _0x3110c2.views + "\n> *DURATION:* " + _0x3110c2.timestamp + "\n> *YTLINK:* " + _0x5ae0df
                }),
                'footer': proto.Message.InteractiveMessage.Footer.create({
                  'text': "© Powered By MERCEDES"
                }),
                'header': proto.Message.InteractiveMessage.Header.create({
                  ...(await prepareWAMessageMedia({
                    'image': {
                      'url': _0x36675b
                    }
                  }, {
                    'upload': _0x19de68.waUploadToServer
                  })),
                  'title': '',
                  'gifPlayback': true,
                  'subtitle': '',
                  'hasMediaAttachment': false
                }),
                'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  'buttons': _0x29678f
                }),
                'contextInfo': {
                  'mentionedJid': [_0x1aa06f.sender],
                  'forwardingScore': 0x270f,
                  'isForwarded': true
                }
              })
            }
          }
        }, {});
        await _0x19de68.relayMessage(_0x30ec7b.key.remoteJid, _0x30ec7b.message, {
          'messageId': _0x30ec7b.key.id
        });
      } else {
        if (_0x3a9183.startsWith("media_")) {
          const _0x44c7d3 = _0x3a9183.split('_');
          const _0x8ce25f = _0x44c7d3[0x1];
          const _0x591100 = parseInt(_0x44c7d3[0x2]);
          const _0xadc892 = searchResultsMap.get(_0x591100);
          if (_0xadc892) {
            try {
              const _0x195b9a = _0x8ce25f.includes('audio') ? "audio" : "video";
              const _0x3893be = {
                'filter': _0x195b9a === 'audio' ? "audioonly" : "videoandaudio",
                'quality': _0x195b9a === "audio" ? 'highestaudio' : "highest"
              };
              const _0x38f2f9 = await new Promise((_0xfb410e, _0x202a8b) => {
                const _0x3c8001 = [];
                _0x3e57ae(_0xadc892.url, {
                  'filter': _0x3893be.filter,
                  'quality': _0x3893be.quality
                }).on("data", _0x34925f => _0x3c8001.push(_0x34925f)).on("end", () => _0xfb410e(Buffer.concat(_0x3c8001))).on("error", _0x202a8b);
              });
              let _0x8d3001;
              if (_0x8ce25f === 'audio') {
                _0x8d3001 = {
                  'audio': _0x38f2f9,
                  'mimetype': "audio/mpeg",
                  'ptt': false,
                  'fileName': _0xadc892.title + '.mp3',
                  'contextInfo': {
                    'mentionedJid': [_0x1aa06f.sender],
                    'externalAdReply': {
                      'title': "↺ |◁   II   ▷|   ♡",
                      'body': "Now playing: " + _0xadc892.title,
                      'thumbnailUrl': _0xadc892.thumbnail,
                      'sourceUrl': _0xadc892.url,
                      'mediaType': 0x1,
                      'renderLargerThumbnail': true
                    }
                  }
                };
              } else {
                if (_0x8ce25f === "video") {
                  _0x8d3001 = {
                    'video': _0x38f2f9,
                    'mimetype': "video/mp4",
                    'fileName': _0xadc892.title + ".mp4",
                    'caption': "> TITLE: " + _0xadc892.title + "\n\n*Downloaded by HANSAMAL-MD*"
                  };
                } else {
                  if (_0x8ce25f === "audiodoc") {
                    _0x8d3001 = {
                      'document': _0x38f2f9,
                      'mimetype': "audio/mpeg",
                      'fileName': _0xadc892.title + ".mp3",
                      'caption': "*Downloaded by HANSAMAL-MD*",
                      'contextInfo': {
                        'externalAdReply': {
                          'showAdAttribution': true,
                          'title': _0xadc892.title,
                          'body': "MERCEDES",
                          'thumbnailUrl': _0xadc892.thumbnail,
                          'sourceUrl': _0xadc892.url,
                          'mediaType': 0x1,
                          'renderLargerThumbnail': true
                        }
                      }
                    };
                  } else {
                    if (_0x8ce25f === "videodoc") {
                      _0x8d3001 = {
                        'document': _0x38f2f9,
                        'mimetype': 'video/mp4',
                        'fileName': _0xadc892.title + ".mp4",
                        'caption': "*Downloaded by HANSAMAL-MD*",
                        'contextInfo': {
                          'externalAdReply': {
                            'showAdAttribution': true,
                            'title': _0xadc892.title,
                            'body': 'HANSAMAL-MD',
                            'thumbnailUrl': _0xadc892.thumbnail,
                            'sourceUrl': _0xadc892.url,
                            'mediaType': 0x1,
                            'renderLargerThumbnail': true
                          }
                        }
                      };
                    } else {
                      return;
                    }
                  }
                }
              }
              await _0x19de68.sendMessage(_0x1aa06f.from, _0x8d3001, {
                'quoted': _0x1aa06f
              });
              await _0x1aa06f.React('✅');
            } catch (_0x5f215b) {
              console.error("Error processing media:", _0x5f215b);
              _0x1aa06f.reply("Error processing media.");
            }
          } else {}
        }
      }
    }
  }
};
export default playcommand;
