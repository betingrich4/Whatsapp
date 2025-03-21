import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

// Format system memory details
const formatBytes = (bytes) => {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + ' GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes.toFixed(2) + ' bytes';
};

// Get bot uptime
const getUptime = () => {
  const uptime = process.uptime();
  const day = Math.floor(uptime / (24 * 3600));
  const hours = Math.floor((uptime % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `*☀️ ${day} Day*\n*🕐 ${hours} Hour*\n*⏰ ${minutes} Minutes*\n*⏱️ ${seconds} Seconds*\n`;
};

// Get greeting based on time
const getGreeting = () => {
  const time = moment().tz("Asia/Colombo").format("HH:mm:ss");
  if (time < "05:00:00") return `Good Morning 🌄`;
  if (time < "11:00:00") return `Good Morning 🌄`;
  if (time < "15:00:00") return `Good Afternoon 🌅`;
  if (time < "18:00:00") return `Good Evening 🌃`;
  return `Good Night 🌌`;
};

// Generate menu message
const generateMenuMessage = async (Matrix, m) => {
  return generateWAMessageFromContent(
    m.from,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `╭─────────────━┈⊷
│ ʙᴏᴛ ɴᴀᴍᴇ: *Football Bot*
│ ᴠᴇʀꜱɪᴏɴ: 1.0.0
│ ᴏᴡɴᴇʀ : *Marisel*      
│ ᴘʟᴀᴛғᴏʀᴍ: *${os.platform()}*
│ ᴍᴏᴅᴇ: *${config.MODE === 'public' ? 'public' : 'private'}*
│ ᴘʀᴇғɪx: [${config.PREFIX}]
╰─────────────━┈⊷`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "Made By You"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              ...(await prepareWAMessageMedia(
                { image: fs.readFileSync('./src/football.jpg') },
                { upload: Matrix.waUploadToServer }
              )),
              title: "",
              gifPlayback: true,
              subtitle: "",
              hasMediaAttachment: false
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "ALIVE",
                    id: `${config.PREFIX}alive`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "PING",
                    id: `${config.PREFIX}ping`
                  })
                },
                {
                  name: "single_select",
                  buttonParamsJson: `{
                    "title": "Tap To Open Menu",
                    "sections": [
                      {
                        "title": "All Menu",
                        "highlight_label": "All Menu",
                        "rows": [
                          {
                            "title": "ᴍᴀɪɴ ᴍᴇɴᴜ",
                            "description": "Bot Main Commands",
                            "id": "Main Menu"
                          },
                          {
                            "title": "ғᴏᴏᴛʙᴀʟʟ ᴍᴇɴᴜ",
                            "description": "Football-related Commands",
                            "id": "Football Menu"
                          }
                        ]
                      }
                    ]
                  }`
                }
              ]
            })
          })
        }
      }
    },
    {}
  );
};

// Handle menu selection
const handleMenuSelection = async (Matrix, m, selectedId) => {
  const prefix = config.PREFIX;
  if (selectedId === "Football Menu") {
    const message = `Hey ${m.pushName} ${getGreeting()}

*╭━❮ 𝙵𝙾𝙾𝚃𝙱𝙰𝙻𝙻 𝙼𝙴𝙽𝚄 ❯━╮*
*┃${prefix}match* 
*┃${prefix}league* 
*┃${prefix}table*
*┃${prefix}fixtures* 
*┃${prefix}topscorers*
*┃${prefix}matchstats*
*┃${prefix}player* 
*╰━━━━━━━━━━━━━━━━━⪼*`;

    await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
  }
};

// Main function
const test = async (m, Matrix) => {
  let selectedListId;
  const selectedButtonId = m?.message?.templateButtonReplyMessage?.selectedId;
  const interactiveResponseMessage = m?.message?.interactiveResponseMessage;

  if (interactiveResponseMessage) {
    const paramsJson = interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
    if (paramsJson) {
      const params = JSON.parse(paramsJson);
      selectedListId = params.id;
    }
  }

  const selectedId = selectedListId || selectedButtonId;
  const cmd = m.body.startsWith(config.PREFIX)
    ? m.body.slice(config.PREFIX.length).split(' ')[0].toLowerCase()
    : '';

  const validCommands = ['footbal', 'hep', 'fota'];
  if (validCommands.includes(cmd)) {
    const msg = await generateMenuMessage(Matrix, m);
    await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id
    });
  }

  await handleMenuSelection(Matrix, m, selectedId);
};

export default test;
