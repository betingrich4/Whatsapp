import { promises as fs } from 'fs';
import path from 'path';
import config from '../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Whitelist storage
const WHITELIST_FILE = path.resolve(__dirname, '../pm_whitelist.json');

// Load or initialize whitelist
async function loadWhitelist() {
    try {
        const data = await fs.readFile(WHITELIST_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Save whitelist
async function saveWhitelist(whitelist) {
    await fs.writeFile(WHITELIST_FILE, JSON.stringify(whitelist, null, 2));
}

const antibot = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        
        // Handle .allow command (owner only)
        if (m.body === `${prefix}allow` && config.OWNERS.includes(m.sender.split('@')[0])) {
            const quoted = m.quoted;
            if (!quoted) return m.reply("Reply to a user's message to allow them");
            
            const userToAllow = quoted.sender;
            const whitelist = await loadWhitelist();
            
            if (!whitelist.includes(userToAllow)) {
                whitelist.push(userToAllow);
                await saveWhitelist(whitelist);
                return m.reply(`✅ ${userToAllow.split('@')[0]} has been whitelisted`);
            }
            return m.reply("ℹ️ User is already whitelisted");
        }

        // Only act in PMs
        if (m.isGroup) return;

        // Check if user is owner or whitelisted
        const whitelist = await loadWhitelist();
        if (config.OWNERS.includes(m.sender.split('@')[0]) || whitelist.includes(m.sender)) {
            return;
        }

        // Check if message is a command (starts with prefix)
        if (m.body?.startsWith(prefix)) {
            // First warning
            const warningCount = m.userWarningCount || 0;
            if (warningCount === 0) {
                m.userWarningCount = 1;
                return m.reply(`*WARNING*\n\nBot commands are not allowed in my PM!\nThis is your first warning. Next violation will result in a block.\n\nIf you need access, contact my owner.`);
            }

            // Block user on second violation
            await gss.updateBlockStatus(m.sender, 'block');
            await m.reply(`*BLOCKED*\n\nYou have been blocked for sending bot commands in my PM.\n\nOwner can unblock with ${prefix}allow`);
            
            // Log the block
            const logEntry = {
                user: m.sender,
                command: m.body,
                timestamp: new Date().toISOString()
            };
            const logFile = path.resolve(__dirname, '../antibot_log.json');
            const currentLogs = await readLogFile(logFile);
            currentLogs.push(logEntry);
            await fs.writeFile(logFile, JSON.stringify(currentLogs, null, 2));
        }

    } catch (error) {
        console.error('Antibot Error:', error);
    }
};

async function readLogFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

export default antibot;
