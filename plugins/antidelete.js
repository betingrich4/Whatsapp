import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import config from '../config.cjs'; // Ensure this contains the owner's number

const AntiDeleteCommand = async (m, Matrix) => {
    // Command Handling for Anti-Delete Toggle
    if (m.body?.toLowerCase() === '#antidelete on') {
        config.ANTI_DELETE = true;
        fs.writeFileSync('./config.cjs', `export default ${JSON.stringify(config, null, 2)};`);
        return await Matrix.sendMessage(m.key.remoteJid, { text: '*ᴇɴᴀʙʟᴇᴅ.*' }, { quoted: m });
    }
    if (m.body?.toLowerCase() === '#antidelete off') {
        config.ANTI_DELETE = false;
        fs.writeFileSync('./config.cjs', `export default ${JSON.stringify(config, null, 2)};`);
        return await Matrix.sendMessage(m.key.remoteJid, { text: '*ᴅɪsᴀʙʟᴇᴅ.*' }, { quoted: m });
    }

    // If Anti-Delete is Disabled, Stop Execution
    if (!config.ANTI_DELETE) return;

    if (!m.message?.protocolMessage) return;
    
    const { remoteJid: chat } = m.key;
    const { protocolMessage } = m.message;
    const { key: deletedMessageKey, type: protocolType } = protocolMessage;

    if (protocolType !== 0) return;

    try {
        const msg = await Matrix.loadMessage(chat, deletedMessageKey);
        if (!msg) return;

        const senderName = msg.pushName || 'Unknown';
        const timestamp = new Date().toLocaleString();
        let text = `🔓 *ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴀʟᴇʀᴛ!*\n\n📩 *ᴄʜᴀᴛ:* ${chat}\n👤 *sᴇɴᴅᴇʀ:* ${senderName}\n🕒 *ᴛɪᴍᴇ:* ${timestamp}`;

        const botNumber = Matrix.user.id.split(':')[0] + '@s.whatsapp.net'; // Bot's number

        // Media Handling
        const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
        const messageType = Object.keys(msg.message || {})[0];

        if (mediaTypes.includes(messageType)) {
            const buffer = await downloadMediaMessage(msg, 'buffer').catch(() => null);
            if (buffer) {
                let mediaPayload;
                const mediaOptions = { quoted: m, caption: text };

                switch (messageType) {
                    case 'imageMessage':
                        mediaPayload = { image: buffer, ...mediaOptions };
                        break;
                    case 'videoMessage':
                        mediaPayload = { video: buffer, mimetype: 'video/mp4', ...mediaOptions };
                        break;
                    case 'audioMessage':
                        mediaPayload = { audio: buffer, mimetype: 'audio/ogg', ptt: true, ...mediaOptions };
                        break;
                    case 'stickerMessage':
                        mediaPayload = { sticker: buffer };
                        break;
                    default:
                        mediaPayload = { document: buffer, mimetype: msg.message[messageType]?.mimetype, ...mediaOptions };
                }

                await Matrix.sendMessage(botNumber, mediaPayload); // Forward media to bot's number
                return;
            }
        }

        // Text Message Handling
        const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        if (textMessage) {
            await Matrix.sendMessage(botNumber, { text: `${text}\n\n📝 *ᴍᴇssᴀɢᴇ:* ${textMessage}` }, { quoted: m });
        }
    } catch (error) {
        console.error('AntiDelete Command Error:', error);
    }
};

export default AntiDeleteCommand;
//JawadTechX The Top Developer 
