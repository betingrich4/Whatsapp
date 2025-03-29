import config from '../../config.cjs';
import yts from 'yt-search';
import axios from 'axios';
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';

const play = async (m, gss) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'play') return;

    if (!query) {
        return m.reply("❌ *Please provide a search query!*");
    }

    await m.React('⏳');

    try {
        const searchResults = await yts(query);
        if (!searchResults.videos.length) {
            return m.reply("❌ *No results found!*");
        }

        const video = searchResults.videos[0];
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎥 Video (MP4)",
                    id: "video_" + video.videoId
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎧 Audio (MP3)",
                    id: "audio_" + video.videoId
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📁 Video (Document)",
                    id: "video_doc_" + video.videoId
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📁 Audio (Document)",
                    id: "audio_doc_" + video.videoId
                })
            }
        ];

        const caption = `
╭━━━〔 *${config.BOT_NAME}* 〕━━━
┃▸ *Title:* ${video.title}
┃▸ *Duration:* ${video.timestamp}
┃▸ *Views:* ${video.views}
┃▸ *Channel:* ${video.author.name}
╰━━━━━━━━━━━━━━━━━━
`;

        const interactiveMsg = generateWAMessageFromContent(m.from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: caption
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `*Powered by Demon Slayer*`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            ...(await prepareWAMessageMedia({
                                image: { url: video.thumbnail }
                            }, { upload: gss.waUploadToServer })),
                            title: video.title.substring(0, 30),
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

    } catch (error) {
        console.error("Error:", error);
        await m.React('❌');
        return m.reply("❌ *An error occurred while processing your request.*");
    }
};

// Handle button interactions
play.before = async (m, gss) => {
    const selectedId = m.message?.templateButtonReplyMessage?.selectedId || 
                      JSON.parse(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || '{}').id;

    if (!selectedId) return;

    try {
        const [type, videoId] = selectedId.split('_');
        const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
        let apiUrl, fileType, mimeType, fileName, caption;

        switch(type) {
            case 'video':
                apiUrl = `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(ytUrl)}`;
                fileType = 'video';
                mimeType = 'video/mp4';
                fileName = `video_${Date.now()}.mp4`;
                caption = '🎥 *Video Download Complete*';
                break;
            case 'audio':
                apiUrl = `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(ytUrl)}`;
                fileType = 'audio';
                mimeType = 'audio/mpeg';
                fileName = `audio_${Date.now()}.mp3`;
                caption = '🎧 *Audio Download Complete*';
                break;
            case 'video_doc':
                apiUrl = `https://api.bwmxmd.online/api/download/ytmp4?apikey=cracker12&url=${encodeURIComponent(ytUrl)}`;
                fileType = 'document';
                mimeType = 'video/mp4';
                fileName = `video_${Date.now()}.mp4`;
                caption = '📁 *Video Document Download Complete*';
                break;
            case 'audio_doc':
                apiUrl = `https://api.bwmxmd.online/api/download/ytmp3?apikey=cracker12&url=${encodeURIComponent(ytUrl)}`;
                fileType = 'document';
                mimeType = 'audio/mpeg';
                fileName = `audio_${Date.now()}.mp3`;
                caption = '📁 *Audio Document Download Complete*';
                break;
            default:
                return;
        }

        const waitMsg = await m.reply('⏳ Downloading... Please wait');
        const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await gss.sendMessage(
            m.from,
            {
                [fileType]: data,
                mimetype: mimeType,
                fileName: fileName,
                caption: `${caption}\n\n🔗 ${ytUrl}\n📥 Via ${config.BOT_NAME}`
            },
            { quoted: m }
        );

        await gss.sendMessage(m.from, { delete: waitMsg.key });
        await m.React('✅');

    } catch (error) {
        console.error("Button Error:", error);
        await m.React('❌');
        return m.reply("❌ *Download failed. Please try again later.*");
    }
};

export default play;
