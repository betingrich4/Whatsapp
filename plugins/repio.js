import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
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
        image: fs.readFileSync('./src/ethix.jpg'),
        caption: responseText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: m });
    }
    return;
  }

  // Main menu command
  if (['list4', 'help4', 'menu4'].includes(cmd)) {
    const greeting = getGreeting();
    const mode = process.env.MODE || 'public';
    
    // Check if it's a self-message
    const isSelfMessage = m.from.endsWith('@s.whatsapp.net') && 
                         m.from === Matrix.user.id.split(':')[0] + '@s.whatsapp.net';
    
    if (isSelfMessage) {
      // Send a numbered list menu for self-messages
      const menuText = `╭─────────────━┈⊷
│🤖 ʙᴏᴛ ɴᴀᴍᴇ: *🇸🇮🇱🇻🇦-🇪🇹🇭🇮🇽*
│📍 ᴠᴇʀꜱɪᴏɴ: 2.0.3
│👨‍💻 ᴏᴡɴᴇʀ : *🇸🇮🇱🇻🇦*      
╰─────────────━┈⊷

📜 *MENU OPTIONS* 📜
1. 🔖 ALL MENU
2. 📥 DOWNLOADER MENU
3. 👥 GROUP MENU
4. 🛠️ TOOL MENU
5. 🏠 MAIN MENU
6. 👑 OWNER MENU

Reply with the number to select`;

      await Matrix.sendMessage(m.from, { 
        text: menuText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      });
    } else {
      // Send interactive buttons for others
      const msg = generateWAMessageFromContent(m.from, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              header: proto.Message.InteractiveMessage.Header.create({
                ...(await prepareWAMessageMedia({ 
                  image: fs.readFileSync('./src/demon.jpg')
                }, { upload: Matrix.waUploadToServer })),
                title: "🇸🇮🇱🇻🇦-🇪🇹🇭🇮🇽 MD",
                subtitle: greeting
              }),
              body: proto.Message.InteractiveMessage.Body.create({
                text: `╭─────────────━┈⊷
│🤖 ʙᴏᴛ ɴᴀᴍᴇ: *🇸🇮🇱🇻🇦-🇪🇹🇭🇮🇽*
│📍 ᴠᴇʀꜱɪᴏɴ: 2.0.3
│👨‍💻 ᴏᴡɴᴇʀ : *🇸🇮🇱🇻🇦*      
│👤 ɴᴜᴍʙᴇʀ: 254743706010
│📡 HOSTER: *${os.platform()}*
│🛡 ᴍᴏᴅᴇ: *${mode}*
│💫 ᴘʀᴇғɪx: *[Multi-Prefix]*
│💾 RAM: ${formatBytes(freeMemoryBytes)}/${formatBytes(totalMemoryBytes)}
│⏳ UPTIME: ${day}d ${hours}h ${minutes}m ${seconds}s
╰─────────────━┈⊷`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "© Powered By 🇸🇮🇱🇻🇦"
              }),
              buttons: [
                {
                  buttonId: 'all_menu',
                  buttonText: { displayText: '🔖 ALL MENU' },
                  type: 1
                },
                {
                  buttonId: 'downloader_menu',
                  buttonText: { displayText: '📥 DOWNLOADER' },
                  type: 1
                },
                {
                  buttonId: 'group_menu',
                  buttonText: { displayText: '👥 GROUP' },
                  type: 1
                },
                {
                  buttonId: 'tool_menu',
                  buttonText: { displayText: '🛠️ TOOLS' },
                  type: 1
                },
                {
                  buttonId: 'main_menu',
                  buttonText: { displayText: '🏠 MAIN' },
                  type: 1
                },
                {
                  buttonId: 'owner_menu',
                  buttonText: { displayText: '👑 OWNER' },
                  type: 1
                }
              ],
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
              }
            })
          }
        }
      }, {});

      await Matrix.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }
  }
};

export default test;
