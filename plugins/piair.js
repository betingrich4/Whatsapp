import { cmd } from '../command.js';
import fetch from 'node-fetch';
import config from '../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Newsletter configuration
const newsletterContext = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: config.CHANNEL_JID || '120363299029326322@newsletter',
        newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
        serverMessageId: 143
    }
};

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Generate WhatsApp pairing code",
    category: "utility",
    use: ".pair +254740075XX",
    filename: __filename
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) {
            return await reply(`*Usage Example:* ${prefix}pair +25474000XX\n\n*Use this code to link your WhatsApp via Linked Devices*`);
        }

        // Validate phone number format
        if (!q.match(/^\+?[0-9]{10,15}$/)) {
            return await reply("❌ Invalid phone number format. Please include country code.\nExample: +9234275822XX");
        }

        const response = await fetch(`https://sessio-6645ccddfbba.herokuapp.com/pair?phone=${encodeURIComponent(q)}`);
        const pair = await response.json();

        if (!pair?.code) {
            return await reply("❌ Failed to generate pairing code. Please check:\n1. Phone number format\n2. API service status\n3. Try again later");
        }

        const pairingCode = pair.code;
        const formattedMessage = `⬤─── *𝖒𝖆𝖗𝖎𝖘𝖊𝖑* ───⬤

📱 *Phone Number:* ${q}
🔢 *Pairing Code:* ${pairingCode}

╰──────────⊷  
⚡ *How to use:*
1. Open WhatsApp > Settings
2. Tap "Linked Devices"
3. Select "Link a Device"
4. Enter this code when prompted

📌 *Note:* Code expires in 20 seconds`;

        await reply(formattedMessage);
        
        // Send raw code separately for easy copy
        await conn.sendMessage(from, { 
            text: pairingCode,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (error) {
        console.error('Pairing Error:', error);
        await reply(`❌ Error: ${error.message}\nPlease try again or contact support.`);
    }
});

export default cmd;
