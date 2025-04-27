import fetch from 'node-fetch';
import config from '../config.cjs';

const pairDevice = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        const args = m.body.slice(prefix.length + cmd.length).trim();

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

        // Check if command matches
        if (cmd !== 'pair' && cmd !== 'getpair' && cmd !== 'clonebot') return;

        // Validate arguments
        if (!args) {
            return m.reply(`*Usage Example:* ${prefix}pair +25474000XX\n\n*Use this code to link your WhatsApp via Linked Devices*`);
        }

        // Validate phone number format
        if (!args.match(/^\+?[0-9]{10,15}$/)) {
            return m.reply("❌ Invalid phone number format. Please include country code.\nExample: +9234275822XX");
        }

        const response = await fetch(`https://sessio-6645ccddfbba.herokuapp.com/pair?phone=${encodeURIComponent(args)}`);
        const pair = await response.json();

        if (!pair?.code) {
            return m.reply("❌ Failed to generate pairing code. Please check:\n1. Phone number format\n2. API service status\n3. Try again later");
        }

        const pairingCode = pair.code;
        const formattedMessage = `⬤─── *𝖒𝖆𝖗𝖎𝖘𝖊𝖑* ───⬤

📱 *Phone Number:* ${args}
🔢 *Pairing Code:* ${pairingCode}

╰──────────⊷  
⚡ *How to use:*
1. Open WhatsApp > Settings
2. Tap "Linked Devices"
3. Select "Link a Device"
4. Enter this code when prompted

📌 *Note:* Code expires in 20 seconds`;

        await m.reply(formattedMessage);
        
        // Send raw code separately for easy copy
        await gss.sendMessage(m.from, { 
            text: pairingCode,
            contextInfo: newsletterContext
        }, { quoted: m });

    } catch (error) {
        console.error('Pairing Error:', error);
        await m.reply(`❌ Error: ${error.message}\nPlease try again or contact support.`);
    }
};

export default pairDevice;
