import { promises as fs } from 'fs';
import path from 'path';
import { cmd, commands } from '../command.js';
import config from '../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Newsletter configuration
const newsletterContext = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: config.CHANNEL_JID || '120363299029326322@newsletter',
        newsletterName: config.CHANNEL_NAME || '𝖒𝖆𝖗𝖎𝖘𝖊𝖑',
        serverMessageId: 143
    }
};

cmd({
    pattern: "get",
    alias: ["source", "js"],
    desc: "Fetch the full source code of a command",
    category: "owner",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, args, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ You don't have permission to use this command!");
        if (!args[0]) return reply("❌ Please provide a command name. Example: `.get alive`");

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => 
            cmd.pattern === commandName || 
            (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!commandData) return reply("❌ Command not found!");

        // Read the full source code
        const fullCode = await fs.readFile(commandData.filename, 'utf-8');

        // Format the code display
        const formattedCode = `⬤───〔 *📜 Command Source* 〕───⬤
\`\`\`javascript
${fullCode.length > 3900 ? fullCode.substring(0, 3900) + "\n\n// ... (truncated)" : fullCode}
\`\`\`
╰──────────⊷  
⚡ Full file sent below 📂  
${config.CHANNEL_NAME || '𝖒𝖆𝖗𝖎𝖘𝖊𝖑'}* 💜`;

        // Send preview
        await conn.sendMessage(from, { 
            image: { url: config.SOURCE_IMAGE_URL || 'https://files.catbox.moe/7zfdcq.jpg' },
            caption: formattedCode,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Send full file
        const fileName = path.basename(commandData.filename);
        await conn.sendMessage(from, {
            document: await fs.readFile(commandData.filename),
            mimetype: 'text/javascript',
            fileName: fileName,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error("Source Fetch Error:", e);
        await reply(`❌ Error fetching source: ${e.message}`);
    }
});

export default cmd;
