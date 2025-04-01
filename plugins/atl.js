import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../config.cjs';

const AutoStlike = async (m, Matrix) => {
    // Only activate if enabled in config
    if (!config.AUTOLIKE_STATUS) return;

    Matrix.ev.on('messages.upsert', async ({ messages }) => {
        try {
            for (const msg of messages) {
                // Check if it's a status update viewed notification
                if (msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {
                    // React with configured emoji
                    await Matrix.sendMessage(msg.key.remoteJid, {
                        react: {
                            text: config.AUTOLIKE_EMOJI || '🙂', // Default to ❤️ if not configured
                            key: msg.key
                        }
                    });

                    console.log(`💖 Liked status from ${msg.pushName || 'user'}`);

                    // Optional: Mark as seen if enabled
                    if (config.AUTO_STATUS_SEEN) {
                        await Matrix.readMessages([msg.key]);
                    }
                }
            }
        } catch (error) {
            console.error('AutoStlike Error:', error);
            // You can add error notification to owner here
        }
    });
};

export default AutoStlike;
