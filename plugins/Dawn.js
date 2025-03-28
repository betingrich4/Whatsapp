import yts from 'yt-search';
import wasitech from 'wasitech';
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import axios from 'axios';
import config from '../../config.cjs';

const searchResultsMap = new Map();
let searchIndex = 1;

const playcommand = async (m, gss) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (!['play', 'ytmp3', 'ytmp4'].includes(cmd)) return;

    try {
        if (!query) {
            return m.reply("*Please provide a search query or YouTube URL*");
        }

        await m.React('🕘');

        // Handle direct YouTube URL downloads
        if (isValidYouTubeUrl(query) && (cmd === 'ytmp3' || cmd === 'ytmp4')) {
            const apiUrl = cmd === 'ytmp3' 
                ? `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(query)}`
                : `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(query)}`;

            const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const ext = cmd === 'ytmp3' ? 'mp3' : 'mp4';
            const type = cmd === 'ytmp3' ? 'audio' : 'video';
            const filename = `yt_dl_${Date.now()}.${ext}`;

            await gss.sendMessage(
                m.from,
                {
                    [type]: data,
                    mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
                    fileName: filename,
                    caption: `*YouTube ${type.toUpperCase()} Download*\n\n` +
                            `*URL:* ${query}\n` +
                            `*Downloaded via:* ${config.BOT_NAME}`
                },
                { quoted: m }
            );
            await m.React('✅');
            return;
        }

        // Handle YouTube search and interactive menu
        const searchResults = await yts(query);
        const videos = searchResults.videos.slice(0, 5);

        if (videos.length === 0) {
            m.reply("No results found.");
            await m.React('❌');
            return;
        }

        videos.forEach((video, index) => {
            const resultId = searchIndex + index;
            searchResultsMap.set(resultId, video);
        });

        const firstResult = searchResultsMap.get(searchIndex);
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎧 AUDIO (API)",
                    id: "api_audio_" + searchIndex
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎥 VIDEO (API)",
                    id: 'api_video_' + searchIndex
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎵 AUDIO (Stream)",
                    id: "media_audio_" + searchIndex
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎦 VIDEO (Stream)",
                    id: "media_video_" + searchIndex
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: "⏩ NEXT",
                    id: "next_" + (searchIndex + 1)
                })
            }
        ];

        const ytLink = "https://www.youtube.com/watch?v=" + firstResult.videoId;
        const interactiveMsg = generateWAMessageFromContent(m.from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `*${config.BOT_NAME} YOUTUBE SEARCH*\n\n` +
                                  `> *TITLE:* ${firstResult.title}\n` +
                                  `> *AUTHOR:* ${firstResult.author.name}\n` +
                                  `> *VIEWS:* ${firstResult.views}\n` +
                                  `> *DURATION:* ${firstResult.timestamp}\n` +
                                  `> *YT LINK:* ${ytLink}\n`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "© Powered By " + config.BOT_NAME
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            ...(await prepareWAMessageMedia({
                                image: { url: firstResult.thumbnail }
                            }, { upload: gss.waUploadToServer })),
                            title: '',
                            gifPlayback: true
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: buttons
                        }),
                        contextInfo: {
                            mentionedJid: [m.sender]
                        }
                    })
                }
            }
        }, {});

        await gss.relayMessage(interactiveMsg.key.remoteJid, interactiveMsg.message, {
            messageId: interactiveMsg.key.id
        });
        await m.React('✅');
        searchIndex += 1;

    } catch (error) {
        console.error("Error:", error);
        m.reply("Error processing your request.");
        await m.React('❌');
    }
};

// Handle button interactions
playcommand.before = async (m, gss) => {
    const selectedId = m.message?.templateButtonReplyMessage?.selectedId || 
                      JSON.parse(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || '{}').id;

    if (!selectedId) return;

    try {
        if (selectedId.startsWith("api_")) {
            const [_, type, index] = selectedId.split('_');
            const video = searchResultsMap.get(parseInt(index));
            
            if (!video) return;

            const apiUrl = type === 'audio' 
                ? `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=https://youtube.com/watch?v=${video.videoId}`
                : `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=https://youtube.com/watch?v=${video.videoId}`;

            const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const ext = type === 'audio' ? 'mp3' : 'mp4';
            const mimeType = type === 'audio' ? 'audio/mpeg' : 'video/mp4';
            const filename = `${video.title}.${ext}`.replace(/[^\w\s.-]/gi, '');

            await gss.sendMessage(
                m.from,
                {
                    [type]: data,
                    mimetype: mimeType,
                    fileName: filename,
                    caption: `✅ *Downloaded via API*\n\n` +
                            `📌 *Title:* ${video.title}\n` +
                            `👤 *Channel:* ${video.author.name}`
                },
                { quoted: m }
            );
            await m.React('✅');

        } else if (selectedId.startsWith("media_")) {
            // Existing stream handling code remains the same
            // ...
        }
    } catch (error) {
        console.error("Button Error:", error);
        m.reply("Error processing your request.");
        await m.React('❌');
    }
};

function isValidYouTubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
}

export default playcommand;
