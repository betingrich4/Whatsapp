
import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';

// Get total memory and free memory in bytes
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();

// Define unit conversions
const byteToKB = 1 / 1024;
const byteToMB = byteToKB / 1024;
const byteToGB = byteToMB / 1024;

// Function to format bytes to a human-readable format
function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) {
    return (bytes * byteToGB).toFixed(2) + ' GB';
  } else if (bytes >= Math.pow(1024, 2)) {
    return (bytes * byteToMB).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes * byteToKB).toFixed(2) + ' KB';
  } else {
    return bytes.toFixed(2) + ' bytes';
  }
}

// Bot Process Time
const uptime = process.uptime();
const day = Math.floor(uptime / (24 * 3600)); // Calculate days
const hours = Math.floor((uptime % (24 * 3600)) / 3600); // Calculate hours
const minutes = Math.floor((uptime % 3600) / 60); // Calculate minutes
const seconds = Math.floor(uptime % 60); // Calculate seconds

// Uptime
const uptimeMessage = `*I am alive now since ${day}d ${hours}h ${minutes}m ${seconds}s*`;
const runMessage = `*☀️ ${day} Day*\n*🕐 ${hours} Hour*\n*⏰ ${minutes} Minutes*\n*⏱️ ${seconds} Seconds*\n`;

const xtime = moment.tz("Asia/Colombo").format("HH:mm:ss");
const xdate = moment.tz("Asia/Colombo").format("DD/MM/YYYY");
const time2 = moment().tz("Asia/Colombo").format("HH:mm:ss");
let pushwish = "";

if (time2 < "05:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "11:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "15:00:00") {
  pushwish = `Good Afternoon 🌅`;
} else if (time2 < "18:00:00") {
  pushwish = `Good Evening 🌃`;
} else if (time2 < "19:00:00") {
  pushwish = `Good Evening 🌃`;
} else {
  pushwish = `Good Night 🌌`;
}

const test = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const mode = config.MODE === 'public' ? 'public' : 'private';
  const pref = config.PREFIX;

  const validCommands = ['aimenu', 'gptmenu', 'menuai'];

  if (validCommands.includes(cmd)) {
    const str = `╭━━━〔 *ᴅᴇᴍᴏɴ-sʟᴀʏᴇʀ* 〕━━━┈⊷
┃★╭──────────────
┃★│ Owner : *ᴛᴇᴀᴍ sʟᴀʏᴇʀ*
┃★│ User : *${m.pushName}*
┃★│ Baileys : *ᴍᴜʟᴛʏ-ᴅᴇᴠɪᴄᴇ*
┃★│ Type : *ɴᴏᴅᴇ.ᴊs*
┃★│ Mode : *${mode}*
┃★│ Platform : *${os.platform()}*
┃★│ Prefix : [${prefix}]
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷ 
> *ʜᴇʏ ${m.pushName} ${pushwish}*
*╭━━━〔 *ᴀɪ ᴍᴇɴᴜ* 〕━━━┈⊷*
*┃◈ ${prefix}𝚖𝚊𝚛𝚒𝚜𝚎𝚕*
*┃◈ ${prefix}𝚐𝚙𝚝*
*┃◈ ${prefix}𝚐𝚙𝚝𝟸*
*┃◈ ${prefix}𝚍𝚊𝚕𝚕𝚎*
*┃◈ ${prefix}𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚎*
*┃◈ ${prefix}𝚖𝚎𝚝𝚊𝚊𝚒*
*┃◈ ${prefix}𝚋𝚕𝚊𝚌𝚔𝚋𝚘𝚡*
*┃◈ ${prefix}𝚕𝚕𝚊𝚖𝚊*
*┃◈ ${prefix}𝚍𝚎𝚎𝚙𝚜𝚎𝚎𝚔*
*┃◈ ${prefix}𝚍𝚎𝚎𝚙𝚜𝚎𝚎𝚔𝚊𝚒*
*┃◈ ${prefix}𝚖𝚒𝚜𝚝𝚛𝚊𝚕*
*┃◈ ${prefix}𝚒𝚖𝚊𝚐𝚒𝚗𝚎*
*┃◈ ${prefix}𝚒𝚖𝚊𝚐𝚎𝚗*
*┃◈ ${prefix}𝚙𝚑𝚘𝚝𝚘𝚊𝚒*
*┃◈ ${prefix}𝚕𝚎𝚝𝚝𝚎𝚛𝚊𝚒*
*┃◈ ${prefix}𝚍𝚘𝚙𝚙𝚕𝚎𝚊𝚒*
*┃◈ ${prefix}𝚍𝚋𝚛𝚡*
*┃◈ ${prefix}𝚍𝚎𝚖𝚘𝚗*
*╰━━━━━━━━━━━━━━━━━━━┈⊷*`;

    await Matrix.sendMessage(m.from, {
      image: fs.readFileSync('./media/slayer5.jpg'),
      caption: str,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363299029326322@newsletter',
          newsletterName: "ᴅᴇᴍᴏɴ sʟᴀʏᴇʀ",
          serverMessageId: 143
        }
      }
    }, {
      quoted: m
    });

    // Send audio after sending the menu
    await Matrix.sendMessage(m.from, {
      audio: { url: 'https://github.com/JawadYTX/KHAN-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m });
  }
};

export default test
