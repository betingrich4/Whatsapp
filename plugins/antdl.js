import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../config.cjs';

const AntiDelete = async (m, Matrix) => {
    // Only activate if anti-delete is enabled in config
    if (!config.ANTI_DELETE) return;

    Matrix.ev.on('messages.update', async (update) => {
        try {
            for (const { key, update: { message: deletedMessage } } of update) {
                // Ignore if the message wasn't deleted or if it's from the bot
                if (!deletedMessage || key.fromMe) continue;

                // Get the chat and sender info
                const chat = await Matrix.groupMetadata(key.remoteJid).catch(() => null);
                const sender = chat?.participants.find(p => p.id === key.participant);

                // Prepare the notification message
                const antiDeleteMsg = `╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *DELETED MESSAGE DETECTED*
┃▸└───────────···๏
╰────────────────┈⊷
╭━━〔 *Message Info* 〕━━┈⊷
┇๏ *Sender:* @${key.participant.split('@')[0]}
┇๏ *Chat:* ${chat?.subject || 'Private Chat'}
┇๏ *Time:* ${new Date().toLocaleTimeString()}
╰━━━━━━━━━━━━──┈⊷
╭━━〔 *Original Content* 〕━━┈⊷
┇๏ ${deletedMessage?.conversation || 
    deletedMessage?.extendedTextMessage?.text || 
    '[Media Message]'}
╰━━━━━━━━━━━━──┈⊷
> *© 3 MEN ARMY*`;

                // Send the notification with mention
                await Matrix.sendMessage(key.remoteJid, { 
                    text: antiDeleteMsg,
                    mentions: [key.participant]
                });

                // Log the deletion
                console.log(`Message deleted by ${key.participant} in ${key.remoteJid}`);
            }
        } catch (error) {
            console.error('Anti-Delete Error:', error);
        }
    });
};

export default AntiDelete;
