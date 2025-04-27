import { promises as fs } from 'fs';
import path from 'path';
import config from '../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const antibad = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const body = m.body.slice(prefix.length + cmd.length).trim();

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

    // Skip if not a message or antibad is disabled
    if (config.ANTI_BAD_WORD !== "true" || !m.body) return;

    const badWords = [
      "wtf", "mia", "xxx", "fuck", "sex", 
      "huththa", "pakaya", "ponnaya", "hutto",
      "punda", "kunna", "pool", "modda", "kotha"
    ];

    const messageText = m.body.toLowerCase();
    const containsBadWord = badWords.some(word => messageText.includes(word));

    if (!containsBadWord) return;

    const from = m.from;
    const sender = m.sender;

    // Delete the offending message
    await gss.sendMessage(from, { 
      delete: m.key 
    });

    // Send warning
    await gss.sendMessage(from, { 
      text: "🚫 ⚠️ BAD WORDS NOT ALLOWED ⚠️ 🚫",
      contextInfo: newsletterContext
    });

    // Log the violation
    const logEntry = {
      user: sender,
      message: m.body,
      timestamp: new Date().toISOString(),
      action: m.isGroup ? "message deleted, user removal attempted" : "message deleted, user blocked"
    };

    const logFile = path.resolve(__dirname, '../bad_words_log.json');
    const currentLogs = await readLogFile(logFile);
    currentLogs.push(logEntry);
    await fs.writeFile(logFile, JSON.stringify(currentLogs, null, 2));

    // Handle DMs: Block the sender
    if (!m.isGroup) {
      await gss.updateBlockStatus(sender, 'block');
      await gss.sendMessage(from, { 
        text: "🚫 You have been blocked for using inappropriate language.",
        contextInfo: newsletterContext
      });
      return;
    }

    // Handle Groups: Remove the user if bot is admin and sender is not admin
    if (m.isGroup && m.isBotAdmin && !m.isAdmin) {
      await gss.groupParticipantsUpdate(from, [sender], 'remove');
      await gss.sendMessage(from, { 
        text: `🚫 ${sender.split('@')[0]} has been removed from the group for using bad words.`,
        contextInfo: newsletterContext
      });
    }

  } catch (error) {
    console.error('Anti-Bad Words Error:', error);
    await m.reply("❌ An error occurred while processing the message.");
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

export default antibad;
