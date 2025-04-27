import fetch from 'node-fetch';
import config from '../config.cjs';

const gitClone = async (m, gss) => {
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
                newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                serverMessageId: 143
            }
        };

        // Check if command matches
        if (cmd !== 'gitclone' && cmd !== 'git' && cmd !== 'github') return;

        // Validate arguments
        if (!args[0]) {
            return m.reply(`❌ Please provide a GitHub repository URL\n\n*Example:*\n${prefix}gitclone https://github.com/username/repo\n\n*Powered by 𝖒𝖆𝖗𝖎𝖘𝖊𝖑*`);
        }

        // Validate GitHub URL
        const githubRegex = /^(https?:\/\/)?github\.com\/([^\/]+)\/([^\/]+)(\/|\.git)?$/i;
        if (!githubRegex.test(args[0])) {
            return m.reply("⚠️ Invalid GitHub URL format\n\nPlease use: https://github.com/username/repository\n\n*Powered by 𝖒𝖆𝖗𝖎𝖘𝖊𝖑*");
        }

        // Extract username and repository
        const [, , username, repo] = args[0].match(githubRegex);
        const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

        // Verify repository exists
        const headResponse = await fetch(zipUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
            return m.reply(`❌ Repository not found or private\n\nFailed to access: ${username}/${repo}\n\n*Powered by 𝖒𝖆𝖗𝖎𝖘𝖊𝖑*`);
        }

        // Get filename from headers or generate default
        const contentDisposition = headResponse.headers.get('content-disposition');
        const fileName = contentDisposition 
            ? contentDisposition.match(/filename="?(.+?)"?$/)[1] 
            : `${repo}-${Date.now()}.zip`;

        // Send download notification
        await m.reply(`⬤─── *GitHub Download* ───⬤\n\n📦 *Repository:* ${username}/${repo}\n🔗 *Source:* ${args[0]}\n📁 *File:* ${fileName}\n\n⬤ *Status:* Downloading...\n╰──────────⊷\n\n*Powered by 𝖒𝖆𝖗𝖎𝖘𝖊𝖑*`);

        // Send the zip file
        await gss.sendMessage(m.from, {
            document: { url: zipUrl },
            fileName: fileName,
            mimetype: 'application/zip',
            contextInfo: newsletterContext
        }, { quoted: m });

    } catch (error) {
        console.error('GitHub Clone Error:', error);
        await m.reply(`❌ Download failed\n\n*Error:* ${error.message}\n\nPlease check:\n1. Repository URL\n2. Internet connection\n3. Try again later\n\n*𝖒𝖆𝖗𝖎𝖘𝖊𝖑*`);
    }
};

export default gitClone;
