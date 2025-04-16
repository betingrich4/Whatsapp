/**
 * =====================================================
 *         DEMON-SLAYER | ANTI-DELETE SYSTEM
 * =====================================================
 *  - Restores deleted messages with newsletter styling
 *  - Uses identical forwarding context as other modules
 *  - Matches your menu.js message format exactly
 * =====================================================
 */

import fs from 'fs';
import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage } = pkg;
import config from '../config.cjs';

// Newsletter configuration (matches your menu.js)
const newsletterContext = {
  mentionedJid: [],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363299029326322@newsletter',
    newsletterName: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
    serverMessageId: 143
  }
};

// ==========================
//   CLASS: AntiDelete Core
// ==========================
class AntiDeleteSystem {
  constructor() {
    this.enabled = false;
    this.messageCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000;
    this.cleanupInterval = setInterval(() => this.cleanExpiredMessages(), this.cacheExpiry);
  }

  cleanExpiredMessages() {
    const now = Date.now();
    for (const [key, msg] of this.messageCache.entries()) {
      if (now - msg.timestamp > this.cacheExpiry) {
        this.messageCache.delete(key);
      }
    }
  }

  formatTime(timestamp) {
    const options = {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return new Date(timestamp).toLocaleString('en-PK', options) + ' (PKT)';
  }
}

// ==========================
//     MAIN IMPLEMENTATION
// ==========================
const antiDelete = new AntiDeleteSystem();

const AntiDelete = async (m, Matrix) => {
  const formatJid = (jid) => jid?.replace(/@s\.whatsapp\.net|@g\.us/g, '') || 'Unknown';

  // Toggle Command (matches your style)
  if (m.body.toLowerCase() === 'antidelete on') {
    const response = {
      text: `🗡️ *Demon-Slayer Anti-Delete Activated*\n\n` +
            `• Protection: Enabled\n` +
            `• Cache: 5 minutes\n` +
            `• Scope: This Chat\n\n` +
            `_Messages will now be recovered_`,
      contextInfo: newsletterContext
    };
    await Matrix.sendMessage(m.from, response, { quoted: m });
    antiDelete.enabled = true;
    return;
  }

  if (m.body.toLowerCase() === 'antidelete off') {
    const response = {
      text: `🌑 *Anti-Delete Deactivated*\n\n` +
            `Message recovery is now disabled`,
      contextInfo: newsletterContext
    };
    await Matrix.sendMessage(m.from, response, { quoted: m });
    antiDelete.enabled = false;
    return;
  }

  // Message Caching
  Matrix.ev.on('messages.upsert', async ({ messages }) => {
    if (!antiDelete.enabled) return;

    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;

      try {
        const content = msg.message.conversation || 
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption;

        let media, type;
        if (msg.message.imageMessage) {
          const stream = await downloadContentFromMessage(msg.message.imageMessage, 'image');
          media = await bufferizeStream(stream);
          type = 'image';
        }
        // Add other media types here...

        if (content || media) {
          antiDelete.messageCache.set(msg.key.id, {
            content,
            media,
            type,
            sender: formatJid(msg.key.participant || msg.key.remoteJid),
            timestamp: Date.now(),
            chatJid: msg.key.remoteJid
          });
        }
      } catch (error) {
        console.error('Caching error:', error);
      }
    }
  });

  // Deletion Handler (matches your menu.js format)
  Matrix.ev.on('messages.update', async (updates) => {
    if (!antiDelete.enabled) return;

    for (const update of updates) {
      try {
        const { key } = update;
        const cachedMsg = antiDelete.messageCache.get(key.id);
        if (!cachedMsg) continue;

        const recoveryMessage = {
          text: `🗡️ *Recovered Deleted Message*\n\n` +
                `• Sender: @${cachedMsg.sender}\n` +
                `• Time: ${this.formatTime(cachedMsg.timestamp)}\n\n` +
                `${cachedMsg.content || '[Media Message]'}`,
          contextInfo: {
            ...newsletterContext,
            mentionedJid: [`${cachedMsg.sender}@s.whatsapp.net`]
          }
        };

        if (cachedMsg.media) {
          await Matrix.sendMessage(key.remoteJid, {
            [cachedMsg.type]: cachedMsg.media,
            caption: recoveryMessage.text,
            contextInfo: recoveryMessage.contextInfo
          });
        } else {
          await Matrix.sendMessage(key.remoteJid, recoveryMessage);
        }

        antiDelete.messageCache.delete(key.id);
      } catch (error) {
        console.error('Recovery error:', error);
      }
    }
  });
};

// Helper function
async function bufferizeStream(stream) {
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

export default AntiDelete;
