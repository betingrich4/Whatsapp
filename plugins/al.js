import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

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
  let selectedListId;
  const selectedButtonId = m?.message?.templateButtonReplyMessage?.selectedId;
  const interactiveResponseMessage = m?.message?.interactiveResponseMessage;
  if (interactiveResponseMessage) {
    const paramsJson = interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
    if (paramsJson) {
      const params = JSON.parse(paramsJson);
      selectedListId = params.id;
     // console.log(selectedListId);
    }
  }
  const selectedId = selectedListId || selectedButtonId;
  
  const prefix = config.PREFIX;
const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
       
       const mode = config.MODE === 'public' ? 'public' : 'private';
       const pref = config.PREFIX;
           
        const validCommands = ['al', 'hel', 'meno'];

  if (validCommands.includes(cmd)) {
    let msg = generateWAMessageFromContent(m.from, {
      viewOnceMessage: {
        message: {
          "messageContextInfo": {
            "deviceListMetadata": {},
            "deviceListMetadataVersion": 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `╭─────────────━┈⊷
│ʙᴏᴛ ɴᴀᴍᴇ: *Demon Slayer*
│ᴠᴇʀꜱɪᴏɴ: 2.1.0
│ᴏᴡɴᴇʀ : *Crew-Slayer*      
│ɴᴜᴍʙᴇʀ: 218942841878
│ᴘʟᴀᴛғᴏʀᴍ: *${os.platform()}*
│ᴍᴏᴅᴇ: *${mode}*
│ᴘʀᴇғɪx: [${pref}]
╰─────────────━┈⊷ `
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "Made By Crew Slayer"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
                ...(await prepareWAMessageMedia({ image : fs.readFileSync('./src/ethix.jpg')}, { upload: Matrix.waUploadToServer})), 
                  title: ``,
                  gifPlayback: true,
                  subtitle: "",
                  hasMediaAttachment: false  
                }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀᴛᴛᴘ", id: ".attp" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀᴛᴛᴘ2", id: ".attp2" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀᴛᴛᴘ3", id: ".attp3" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴇʙɪɴᴀʀʏ", id: ".ebinary" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴅʙɪɴᴀʀʏ", id: ".dbinary" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴇᴍᴏᴊɪᴍɪx", id: ".emojimix" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴍᴘ3", id: ".mp3" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀɪ", id: ".ai" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʙᴜɢ", id: ".bug" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢᴘᴛ", id: ".gpt" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴅᴀʟʟᴇ", id: ".dalle" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʀᴇᴍɪɴɪ", id: ".remini" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢᴇᴍɪɴɪ", id: ".gemini" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴄᴀʟᴄᴜʟᴀᴛᴏʀ", id: ".calculator" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴛᴇᴍᴘᴍᴀɪʟ", id: ".tempmail" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴄʜᴇᴄᴋᴍᴀɪʟ", id: ".checkmail" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴛʀᴀɴsʟᴀᴛᴇ", id: ".trt" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴛᴛs", id: ".tts" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʟɪɴᴋɢʀᴏᴜᴘ", id: ".linkgroup" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "sᴇᴛᴘᴘɢᴄ", id: ".setppgc" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "sᴇᴛɴᴀᴍᴇ", id: ".setname" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "sᴇᴛᴅᴇsᴄ", id: ".setdesc" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢʀᴏᴜᴘ", id: ".group" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢᴄsᴇᴛᴛɪɴɢ", id: ".gcsetting" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴡᴇʟᴄᴏᴍᴇ", id: ".welcome" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀᴅᴅ", id: ".add" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴋɪᴄᴋ", id: ".kick" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʜɪᴅᴇᴛᴀɢ", id: ".hidetag" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴛᴀɢᴀʟʟ", id: ".tagall" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀɴᴛɪʟɪɴᴋ", id: ".antilink" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀɴᴛɪᴛᴏxɪᴄ", id: ".antitoxic" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴘʀᴏᴍᴏᴛᴇ", id: ".promote" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴅᴇᴍᴏᴛᴇ", id: ".demote" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢᴇᴛʙɪᴏ", id: ".getbio" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴀᴘᴋ", id: ".apk" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ғᴀᴄᴇʙᴏᴏᴋ", id: ".facebook" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴍᴇᴅɪᴀғɪʀᴇ", id: ".mediafire" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴘɪɴᴛᴇʀᴇsᴛᴅʟ", id: ".pinterestdl" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢɪᴛᴄʟᴏɴᴇ", id: ".gitclone" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢᴅʀɪᴠᴇ", id: ".gdrive" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɪɴsᴛᴀ", id: ".insta" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʏᴛᴍᴘ3", id: ".ytmp3" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʏᴛᴍᴘ4", id: ".ytmp4" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴘʟᴀʏ", id: ".play" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "sᴏɴɢ", id: ".song" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴠɪᴅᴇᴏ", id: ".video" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʏᴛᴍᴘ3ᴅᴏᴄ", id: ".ytmp3doc" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʏᴛᴍᴘ4ᴅᴏᴄ", id: ".ytmp4doc" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴛɪᴋᴛᴏᴋ", id: ".tiktok" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʏᴛs", id: ".yts" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɪᴍᴅʙ", id: ".imdb" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢᴏᴏɢʟᴇ", id: ".google" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ɢɪᴍᴀɢᴇ", id: ".gimage" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴘɪɴᴛᴇʀᴇsᴛ", id: ".pinterest" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴡᴀʟʟᴘᴀᴘᴇʀ", id: ".wallpaper" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ᴡɪᴋɪᴍᴇᴅɪᴀ", id: ".wikimedia" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʏᴛsᴇᴀʀᴄʜ", id: ".ytsearch" })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: "ʟɪsᴛ", id: ".list" })
                }
              ]
            })
          })
        }
      }
    }, {});
    await Matrix.relayMessage(m.from, msg.message, { messageId: msg.key.id });
  }
};

export default test;
