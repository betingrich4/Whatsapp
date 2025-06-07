import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import path from 'path';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

// Utility functions
const formatBytes = (bytes) => {
  if (bytes >= Math.pow(1024, 3)) return (bytes / Math.pow(1024, 3)).toFixed(2) + ' GB';
  if (bytes >= Math.pow(1024, 2)) return (bytes / Math.pow(1024, 2)).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes.toFixed(2) + ' bytes';
};

// System info
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();
const uptime = process.uptime();
const day = Math.floor(uptime / (24 * 3600));
const hours = Math.floor((uptime % (24 * 3600)) / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const seconds = Math.floor(uptime % 60);

// Time-based greeting
const getGreeting = () => {
  const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
  if (time < "05:00:00") return "Good Morning 🌄";
  if (time < "11:00:00") return "Good Morning 🌄";
  if (time < "15:00:00") return "Good Afternoon 🌅";
  if (time < "18:00:00") return "Good Evening 🌃";
  if (time < "19:00:00") return "Good Evening 🌃";
  return "Good Night 🌌";
};

// Fancy text generator
const toFancyFont = (text) => {
  const fonts = {
    'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
    'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
    'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
    'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
  };
  return text.split('').map(char => fonts[char] || char).join('');
};

// Menu categories with commands
const menuCategories = {
  "ALL MENU": {
    description: "Show all available commands",
    commands: [
      `${prefix}Attp`, `${prefix}Attp2`, `${prefix}Attp3`, `${prefix}Binary`, 
      `${prefix}Emojimix`, `${prefix}Mp3`, `${prefix}Ai`, `${prefix}Bug`,
      // ... other commands
    ]
  },
  "DOWNLOADER MENU": {
    description: "Downloader related commands",
    commands: [
      `${prefix}Apk`, `${prefix}Facebook`, `${prefix}Mediafire`,
      `${prefix}Pinterestdl`, `${prefix}Gitclone`, `${prefix}Gdrive`,
      // ... other download commands
    ]
  },
  // ... other categories
};

const test = async (m, Matrix) => {
  const prefix = /^[\\/!#.]/gi.test(m.body) ? m.body.match(/^[\\/!#.]/gi)[0] : '.';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).toLowerCase() : '';
  
  // Handle button responses
  const selectedButtonId = m?.message?.buttonsResponseMessage?.selectedButtonId;
  const selectedId = selectedButtonId || m?.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
  
  // If it's a button response, handle it
  if (selectedId) {
    let responseText = '';
    let category = '';
    
    switch (selectedId) {
      case 'all_menu':
      case 'View All Menu':
        category = 'ALL MENU';
        break;
      case 'downloader_menu':
      case 'Downloader Menu':
        category = 'DOWNLOADER MENU';
        break;
      // ... other cases
    }
    
    if (category && menuCategories[category]) {
      const menuData = menuCategories[category];
      responseText = `╭───❮ *${category}* ❯───╮\n`;
      responseText += `│📌 ${menuData.description}\n`;
      responseText += `╰─────────────────╯\n\n`;
      responseText += menuData.commands.join('\n');
      responseText += `\n\n╭───❮ *SYSTEM INFO* ❯───╮\n`;
      responseText += `│💾 RAM: ${formatBytes(freeMemoryBytes)}/${formatBytes(totalMemoryBytes)}\n`;
      responseText += `│⏳ UPTIME: ${day}d ${hours}h ${minutes}m ${seconds}s\n`;
      responseText += `╰─────────────────╯\n`;
      responseText += `© Powered By 🇸🇮🇱🇻🇦`;

      await Matrix.sendMessage(m.from, {
        image: fs.readFileSync('./src/demon.jpg'),
        caption: responseText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "🇸🇮🇱🇻🇦-🇪🇹🇭🇮🇽 MD",
            body: "Advanced WhatsApp Bot",
            thumbnail: fs.readFileSync('./src/demon.jpg'),
            sourceUrl: "https://github.com/your-repo"
          }
        }
      }, { quoted: m });
    }
    return;
  }

  // Main menu command
  if (['list4', 'help4', 'menu4'].includes(cmd)) {
    const greeting = getGreeting();
    const mode = process.env.MODE || 'public';
    
    // Create the main menu message with buttons
    let menuText = `◈━━━━━━━━━━━━━━━━◈\n│❒ *Welcome to 🇸🇮🇱🇻🇦-🇪🇹🇭🇮🇽 MD* 😈\n\n`;
    menuText += `🤖 *Bot*: 🇸🇮🇱🇻🇦-🇪🇹🇭🇮🇽 (v2.0.3)\n`;
    menuText += `🔣 *Prefix*: [${prefix}] (Multi-Prefix Supported)\n`;
    menuText += `🌐 *Mode*: ${mode}\n`;
    menuText += `💾 *RAM*: ${formatBytes(freeMemoryBytes)}/${formatBytes(totalMemoryBytes)}\n`;
    menuText += `⏳ *Uptime*: ${day}d ${hours}h ${minutes}m ${seconds}s\n`;
    menuText += `\n◈━━━━━━━━━━━━━━━━◈\n\n`;
    menuText += `*Select a menu option below* 👇\n`;

    // Define button commands
    const buttonCommands = [
      { id: 'all_menu', display: toFancyFont('ALL MENU'), emoji: '📃' },
      { id: 'downloader_menu', display: toFancyFont('DOWNLOADER'), emoji: '📥' },
      { id: 'group_menu', display: toFancyFont('GROUP'), emoji: '👥' },
      { id: 'owner_menu', display: toFancyFont('OWNER'), emoji: '👑' }
    ];

    await Matrix.sendMessage(m.from, {
      text: menuText,
      footer: `Powered By 🇸🇮🇱🇻🇦`,
      buttons: buttonCommands.map(cmd => ({
        buttonId: cmd.id,
        buttonText: { displayText: `${cmd.emoji} ${cmd.display}` },
        type: 1
      })),
      headerType: 1,
      viewOnce: true,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "🇸🇮🇱🇻🇦-🇪🇹🇭🇮🇽 MD",
          body: `Hello ${m.pushName}! Ready to explore?`,
          thumbnail: fs.readFileSync('./src/demon.jpg'),
          sourceUrl: "https://github.com/your-repo",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // Send voice note if available
    const possibleAudioPaths = [
      path.join(__dirname, 'assets', 'menu.mp3'),
      path.join(process.cwd(), 'assets', 'menu.mp3'),
      path.join(__dirname, '..', 'assets', 'menu.mp3'),
    ];

    let audioPath = null;
    for (const possiblePath of possibleAudioPaths) {
      if (fs.existsSync(possiblePath)) {
        audioPath = possiblePath;
        break;
      }
    }

    if (audioPath) {
      await Matrix.sendMessage(m.from, {
        audio: { url: audioPath },
        ptt: true,
        mimetype: 'audio/mpeg',
        fileName: 'menu.mp3'
      }, { quoted: m });
    }
  }
};

export default test;
