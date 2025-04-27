import { promises as fs } from 'fs';
import path from 'path';
import config from '../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Bad words storage and configuration
const BADWORDS_FILE = path.resolve(__dirname, '../badwords_list.json');
const WARNING_FILE = path.resolve(__dirname, '../badwords_warnings.json');

// Load bad words list
async function loadBadWords() {
    try {
        const data = await fs.readFile(BADWORDS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        // Default bad words list if file doesn't exist
        return [
            'fuck', 'shit', 'bitch', 'asshole', 'cunt',
            'nigger', 'nigga', 'whore', 'slut', 'dick',
            'pussy', 'bastard', 'motherfucker', 'cock'
        ].map(word => word.toLowerCase());
    }
}

// Load or initialize warnings
async function loadWarnings() {
    try {
        const data = await fs.readFile(WARNING_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

// Save warnings
async function saveWarnings(warnings) {
    await fs.writeFile(WARNING_FILE, JSON.stringify(warnings, null, 2));
}

const antibadword = async (m, gss) => {
    try {
        const prefix = config.PREFIX;
        
        // Skip if message is from owner
        if (config.OWNERS.includes(m.sender.split('@')[0])) {
            return;
        }

        // Load bad words and warnings
        const badWords = await loadBadWords();
        let warnings = await loadWarnings();
        const userId = m.sender;

        // Check if message contains bad words
        const messageText = m.body?.toLowerCase() || '';
        const detectedBadWords = badWords.filter(word => 
            messageText.includes(word.toLowerCase())
        );

        if (detectedBadWords.length > 0) {
            // Initialize user warnings if not exists
            if (!warnings[userId]) {
                warnings[userId] = {
                    count: 0,
                    lastWarning: null
                };
            }

            // Increment warning count
            warnings[userId].count += 1;
            warnings[userId].lastWarning = new Date().toISOString();
            await saveWarnings(warnings);

            if (m.isGroup) {
                // Group chat handling
                if (warnings[userId].count === 1) {
                    // First warning - delete message and warn
                    await m.delete();
                    await m.reply(`⚠️ *WARNING* ⚠️\n@${m.sender.split('@')[0]}, your message contained inappropriate language.\nNext violation will result in removal from the group.`);
                } else {
                    // Second offense - remove from group
                    try {
                        await m.delete();
                        await gss.groupParticipantsUpdate(
                            m.chat,
                            [m.sender],
                            'remove'
                        );
                        await m.reply(`🚫 *REMOVED* 🚫\n@${m.sender.split('@')[0]} has been removed for repeated use of inappropriate language.`);
                        
                        // Reset warnings after action
                        warnings[userId].count = 0;
                        await saveWarnings(warnings);
                    } catch (error) {
                        console.error('Failed to remove participant:', error);
                    }
                }
            } else {
                // Private message handling - block immediately
                await gss.updateBlockStatus(m.sender, 'block');
                await m.reply(`🚫 *BLOCKED* 🚫\nYou have been blocked for using inappropriate language in private chat.`);
                
                // Log the block
                const logEntry = {
                    user: m.sender,
                    message: m.body,
                    badWords: detectedBadWords,
                    timestamp: new Date().toISOString()
                };
                const logFile = path.resolve(__dirname, '../badwords_block_log.json');
                const currentLogs = await readLogFile(logFile);
                currentLogs.push(logEntry);
                await fs.writeFile(logFile, JSON.stringify(currentLogs, null, 2));
            }
        }

    } catch (error) {
        console.error('Antibadword Error:', error);
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

export default antibadword;
