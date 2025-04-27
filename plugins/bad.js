import { promises as fs } from 'fs';
import path from 'path';
import { cmd } from '../command.js';
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

// Anti-Bad Words System
cmd({
    pattern: "antibad",
    desc: "Filter and delete messages containing bad words, block in DMs, remove in groups",
    on: "body"
}, async (conn, m, store, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        const badWords = [
            "wtf", "mia", "xxx", "fuck", "sex", 
            "huththa", "pakaya", "ponnaya", "hutto",
            "punda", "kunna", "pool", "modda", "kotha"
        ];

        const messageText = body.toLowerCase();
        const containsBadWord = badWords.some(word => messageText.includes(word));

        if (!containsBadWord || config.ANTI_BAD_WORD !== "true") {
            return;
        }

        // Common actions for both DMs and groups
        await conn.sendMessage(from, { 
            delete: m.key 
        }, { 
            quoted: m 
        });

        await conn.sendMessage(from, { 
            text: "🚫 ⚠️ BAD WORDS NOT ALLOWED ⚠️ 🚫",
            contextInfo: newsletterContext
        }, { 
            quoted: m 
        });

        // Log the violation
        const logEntry = {
            user: sender,
            message: body,
            timestamp: new Date().toISOString(),
            action: isGroup ? "message deleted, user removal attempted" : "message deleted, user blocked"
        };

        const logFile = path.resolve(__dirname, '../bad_words_log.json');
        const currentLogs = await readLogFile(logFile);
        currentLogs.push(logEntry);
        await fs.writeFile(logFile, JSON.stringify(currentLogs, null, 2));

        // Handle DMs: Block the sender
        if (!isGroup) {
            await conn.updateBlockStatus(sender, 'block');
            await conn.sendMessage(from, { 
                text: "🚫 You have been blocked for using inappropriate language.",
                contextInfo: newsletterContext
            }, { 
                quoted: m 
            });
            return;
        }

        // Handle Groups: Remove the user if bot is admin and sender is not admin
        if (isGroup && isBotAdmins && !isAdmins) {
            await conn.groupParticipantsUpdate(from, [sender], 'remove');
            await conn.sendMessage(from, { 
                text: `🚫 ${sender.split('@')[0]} has been removed from the group for using bad words.`,
                contextInfo: newsletterContext
            }, { 
                quoted: m 
            });
        }

    } catch (error) {
        console.error('Anti-Bad Words Error:', error);
        await reply("❌ An error occurred while processing the message.");
    }
});

async function readLogFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

export default cmd;
