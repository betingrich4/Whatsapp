import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../config.cjs';

const AutoStatus = async (m, Matrix) => {
    // Only activate if enabled in config
    if (!config.AUTO_STATUS_REACT) return;

    Matrix.ev.on('messages.upsert', async ({ messages }) => {
        try {
            for (const msg of messages) {
                // Check if it's a status update viewed notification
                if (msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {
                    // React with your preferred emoji
                    await Matrix.sendMessage(msg.key.remoteJid, {
                        react: {
                            text: '❤️', // Change to your preferred reaction emoji
                            key: msg.key
                        }
                    });

                    // Optional: Send seen receipt
                    if (config.AUTO_STATUS_SEEN) {
                        await Matrix.readMessages([msg.key]);
                    }

                    console.log(`Reacted to status view from ${msg.pushName}`);
                }
            }
        } catch (error) {
            console.error('AutoStatus Error:', error);
        }
    });
};

export default AutoStatus;
