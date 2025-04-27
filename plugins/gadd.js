import { promises as fs } from 'fs';
import path from 'path';
import config from '../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const getSource = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');

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

        // Check if user is owner
        if (!config.OWNERS.includes(m.sender.split('@')[0])) {
            return m.reply("❌ You don't have permission to use this command!");
        }

        // Check if command name was provided
        if (!args[0]) {
            return m.reply("❌ Please provide a command name. Example: `.cmd alive`");
        }

        // This would need to be replaced with your actual command list
        // You'll need to implement a way to track command filenames
        const commandName = args[0].toLowerCase();
        const commandData = {
            // This is just an example - you'll need to implement your own command tracking
            filename: path.join(__dirname, `${commandName}.js`)
        };

        try {
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
            await gss.sendMessage(m.from, { 
                image: { url: config.SOURCE_IMAGE_URL || 'https://files.catbox.moe/7zfdcq.jpg' },
                caption: formattedCode,
                contextInfo: newsletterContext
            }, { quoted: m });

            // Send full file
            const fileName = path.basename(commandData.filename);
            await gss.sendMessage(m.from, {
                document: await fs.readFile(commandData.filename),
                mimetype: 'text/javascript',
                fileName: fileName,
                contextInfo: newsletterContext
            }, { quoted: m });

        } catch (e) {
            console.error("Source Fetch Error:", e);
            return m.reply("❌ Command not found or couldn't read the file!");
        }

    } catch (e) {
        console.error("Command Error:", e);
        await m.reply(`❌ Error: ${e.message}`);
    }
};

export default getSource;
