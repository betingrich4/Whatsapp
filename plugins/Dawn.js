import yts from 'yt-search';
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import axios from 'axios';
import fs from 'fs';
import config from '../../config.cjs';

const searchResultsMap = new Map();
let searchIndex = 1;

const youtubeHandler = async (m, gss) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (!['play', 'ytmp3', 'ytmp4'].includes(cmd)) return;

    try {
        if (!query) {
            return m.reply(`❌ Please provide a search query or YouTube URL\n\nUsage: ${prefix}${cmd} <query/url>`);
        }

        await m.React('🕘');

        // Handle direct YouTube URL downloads
        if (isValidYouTubeUrl(query) && (cmd === 'ytmp3' || cmd === 'ytmp4')) {
            const waitMsg = await m.reply('⏳ Downloading... Please wait');
            
            try {
                const apiUrl = cmd === 'ytmp3' 
                    ? `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(query)}`
                    : `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(query)}`;

                const { data } = await axios.get(apiUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 60000 // 1 minute timeout
                });

                if (!data || data.length === 0) {
                    throw new Error('Empty response from API');
                }

                // Save temporary file
                const ext = cmd === 'ytmp3' ? 'mp3' : 'mp4';
                const filename = `yt_${Date.now()}.${ext}`;
                const filepath = `./temp/${filename}`;
                fs.writeFileSync(filepath, data);

                // Send file
                await gss.sendMessage(
                    m.from,
                    {
                        [cmd === 'ytmp3' ? 'audio' : 'video']: { url: filepath },
                        mimetype: cmd === 'ytmp3' ? 'audio/mpeg' : 'video/mp4',
                        fileName: filename,
                        caption: `✅ *YouTube ${cmd === 'ytmp3' ? 'MP3' : 'MP4'} Download*\n\n` +
                                `🔗 ${query}\n` +
                                `📥 Via ${config.BOT_NAME}`
                    },
                    { quoted: m }
                );

                // Clean up
                fs.unlinkSync(filepath);
                await gss.sendMessage(m.from, { delete: waitMsg.key });
                await m.React('✅');
            } catch (error) {
                console.error('API Download Error:', error);
                await gss.sendMessage(m.from, { delete: waitMsg.key });
                await m.React('❌');
                return m.reply(`❌ Failed to download: ${error.message}\n\nTrying fallback method...`);
                
                // Fallback to streaming method if API fails
                return handleYTSearch(m, gss, query, true);
            }
            return;
        }

        // Handle YouTube search
        await handleYTSearch(m, gss, query);
        
    } catch (error) {
        console.error("Error:", error);
        await m.React('❌');
        return m.reply("❌ Error processing your request. Please try again later.");
    }
};

async function handleYTSearch(m, gss, query, isFallback = false) {
    try {
        const searchResults = await yts(query);
        const videos = searchResults.videos.slice(0, 5);

        if (videos.length === 0) {
            await m.React('❌');
            return m.reply("No results found.");
        }

        videos.forEach((video, index) => {
            searchResultsMap.set(searchIndex + index, video);
        });

        const firstResult = searchResultsMap.get(searchIndex);
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎧 MP3 (Fast API)",
                    id: "api_audio_" + searchIndex
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎥 MP4 (Fast API)",
                    id: 'api_video_' + searchIndex
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎵 MP3 (Stream)",
                    id: "stream_audio_" + searchIndex
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎦 MP4 (Stream)",
                    id: "stream_video_" + searchIndex
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: "⏩ Next Result",
                    id: "next_" + (searchIndex + 1)
                })
            }
        ];

        const ytLink = `https://youtu.be/${firstResult.videoId}`;
        const interactiveMsg = generateWAMessageFromContent(m.from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `*${config.BOT_NAME} YouTube Search*\n\n` +
                                  `📌 *Title:* ${firstResult.title}\n` +
                                  `👤 *Channel:* ${firstResult.author.name}\n` +
                                  `👀 *Views:* ${firstResult.views}\n` +
                                  `⏱ *Duration:* ${firstResult.timestamp}\n` +
                                  `🔗 *URL:* ${ytLink}`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `Powered by ${config.BOT_NAME}${isFallback ? ' (Fallback Mode)' : ''}`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            ...(await prepareWAMessageMedia({
                                image: { url: firstResult.thumbnail }
                            }, { upload: gss.waUploadToServer })),
                            title: firstResult.title.substring(0, 30),
                            gifPlayback: false
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
        console.error("Search Error:", error);
        await m.React('❌');
        return m.reply("❌ Error processing your search. Please try again.");
    }
}

// Handle button interactions
youtubeHandler.before = async (m, gss) => {
    const selectedId = m.message?.templateButtonReplyMessage?.selectedId || 
                      JSON.parse(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || '{}').id;

    if (!selectedId) return;

    try {
        if (selectedId.startsWith("api_")) {
            const [_, type, index] = selectedId.split('_');
            const video = searchResultsMap.get(parseInt(index));
            
            if (!video) return;

            const waitMsg = await m.reply(`⏳ Downloading ${type.toUpperCase()} via API...`);
            const ytUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
            
            try {
                const apiUrl = type === 'audio' 
                    ? `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(ytUrl)}`
                    : `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(ytUrl)}`;

                const { data } = await axios.get(apiUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 60000
                });

                if (!data || data.length === 0) {
                    throw new Error('Empty response from API');
                }

                const ext = type === 'audio' ? 'mp3' : 'mp4';
                const filename = `${video.title}.${ext}`.replace(/[^\w\s.-]/gi, '');
                const filepath = `./temp/${filename}`;
                fs.writeFileSync(filepath, data);

                await gss.sendMessage(
                    m.from,
                    {
                        [type === 'audio' ? 'audio' : 'video']: { url: filepath },
                        mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
                        fileName: filename,
                        caption: `✅ *Downloaded ${type.toUpperCase()}*\n\n` +
                                `📌 *Title:* ${video.title}\n` +
                                `👤 *Channel:* ${video.author.name}`
                    },
                    { quoted: m }
                );

                fs.unlinkSync(filepath);
                await gss.sendMessage(m.from, { delete: waitMsg.key });
                await m.React('✅');

            } catch (error) {
                console.error('API Button Error:', error);
                await gss.sendMessage(m.from, { delete: waitMsg.key });
                await m.React('❌');
                return m.reply(`❌ API download failed: ${error.message}\n\nTrying stream method...`);
            }

        } else if (selectedId.startsWith("next_")) {
            // Next button handling remains the same
            // ...
        }
    } catch (error) {
        console.error("Button Error:", error);
        await m.React('❌');
        return m.reply("❌ Error processing your request.");
    }
};

function isValidYouTubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
}

youtubeHandler.help = ['play', 'ytmp3', 'ytmp4'];
youtubeHandler.tags = ['downloader'];
youtubeHandler.command = ['play', 'ytmp3', 'ytmp4'];

export default youtubeHandler;
