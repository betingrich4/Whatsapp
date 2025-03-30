import config from '../config.cjs';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

const AllVars = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === 'allvar' || cmd === 'settings') {
        try {
            await m.React('⚙️');
            
            const envSettings = `╭━━━〔 *3 MEN ARMY BOT* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *BOT CONFIGURATION*
┃▸└───────────···๏
╰────────────────┈⊷
╭━━〔 *CORE SETTINGS* 〕━━┈⊷
┇๏ *Prefix:* ${config.PREFIX || '.'}
┇๏ *Mode:* ${config.MODE || 'public'}
┇๏ *Owner:* ${config.OWNER_NUMBER || 'Not set'}
┇๏ *Session ID:* ${config.SESSION_ID ? '********' : 'Not set'}
╰━━━━━━━━━━━━──┈⊷
╭━━〔 *FEATURE TOGGLES* 〕━━┈⊷
┇๏ *AutoBio:* ${config.AUTO_BIO ? '✅ Enabled' : '❌ Disabled'}
┇๏ *Status View:* ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅ Enabled" : "❌ Disabled"}
┇๏ *Auto React:* ${isEnabled(config.AUTO_REACT) ? "✅ Enabled" : "❌ Disabled"}
┇๏ *Anti-Link:* ${isEnabled(config.ANTI_LINK) ? "✅ Enabled" : "❌ Disabled"}
┇๏ *Auto Typing:* ${isEnabled(config.AUTO_TYPING) ? "✅ Enabled" : "❌ Disabled"}
┇๏ *Auto Recording:* ${isEnabled(config.AUTO_RECORDING) ? "✅ Enabled" : "❌ Disabled"}
┇๏ *Always Online:* ${isEnabled(config.ALWAYS_ONLINE) ? "✅ Enabled" : "❌ Disabled"}
┇๏ *Mode:* ${isEnabled(config.MODE) ? "✅ Enabled" : "❌ Disabled"}
┇๏ *Read Message:* ${isEnabled(config.READ_MESSAGE) ? "✅ Enabled" : "❌ Disabled"}
╰━━━━━━━━━━━━──┈⊷
╭━━〔 *SYSTEM INFO* 〕━━┈⊷
┇๏ *Uptime:* ${formatUptime(process.uptime())}
┇๏ *Platform:* ${process.platform}
┇๏ *Node Version:* ${process.version}
╰━━━━━━━━━━━━──┈⊷
> *Marisel*`;

            await Matrix.sendMessage(m.from, {
                image: { url: "https://files.catbox.moe/5kvvfg.jpg" },
                caption: envSettings,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: m });

            await m.React('✅');
        } catch (error) {
            console.error('Error displaying vars:', error);
            await m.reply('Failed to retrieve configuration.');
            await m.React('❌');
        }
    }
};

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    seconds %= 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default AllVars;
