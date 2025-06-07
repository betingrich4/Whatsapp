// plugin/menu.js
import fs from 'fs';
import os from 'os';
import moment from 'moment-timezone';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

// Convert bytes to human-readable format
const formatBytes = bytes => {
  if (bytes >= 1 << 30) return (bytes / (1 << 30)).toFixed(2) + ' GB';
  if (bytes >= 1 << 20) return (bytes / (1 << 20)).toFixed(2) + ' MB';
  if (bytes >= 1 << 10) return (bytes / (1 << 10)).toFixed(2) + ' KB';
  return bytes.toFixed(2) + ' bytes';
};

export default async function menuPlugin(m, sock) {
  // Handle button/list replies
  const tpl = m.message?.templateButtonReplyMessage;
  const native = m.message?.interactiveResponseMessage;

  let selectedId =
    tpl?.selectedId ||
    (native?.nativeFlowResponseMessage?.paramsJson &&
      JSON.parse(native.nativeFlowResponseMessage.paramsJson).id);

  // Send appropriate menu on command
  if (m.body && ['menu4', 'help3', 'list'].includes(m.body.slice(1).toLowerCase())) {
    const totalMem = formatBytes(os.totalmem());
    const freeMem = formatBytes(os.freemem());

    const uptime = Math.floor(process.uptime());
    const day = Math.floor(uptime / 86400);
    const hr = Math.floor((uptime % 86400) / 3600);
    const min = Math.floor((uptime % 3600) / 60);
    const sec = uptime % 60;

    const timeNow = moment().tz('Africa/Nairobi').format('HH:mm:ss');
    const hour = Number(timeNow.split(':')[0]);
    const pushwish = hour < 11
      ? 'Good Morning 🌄'
      : hour < 15
      ? 'Good Afternoon 🌅'
      : hour < 19
      ? 'Good Evening 🌃'
      : 'Good Night 🌌';

    const header = `╭─〔 *Bot Dashboard* 〕
│🤖 *Name:* ${config.BOT_NAME || 'King'}
│📅 *Time:* ${timeNow}
│📡 *Uptime:* ${day}d ${hr}h ${min}m ${sec}s
│💾 *RAM:* Total ${totalMem} ↪️ Free ${freeMem}
│🕒 ${pushwish}
╰─────────────`;

    // Send list menu
    const msg = generateWAMessageFromContent(m.from, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text: header }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: '© Powered by Silva Tech Inc' }),
            header: proto.Message.InteractiveMessage.Header.create({
              ...(await prepareWAMessageMedia(
                { image: fs.readFileSync('./src/demon.jpg') },
                { upload: sock.waUploadToServer }
              )),
              title: '',
              subtitle: '',
              hasMediaAttachment: true
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'main_menu',
                  buttonParamsJson: JSON.stringify({
                    title: '📂 MENU CATEGORIES',
                    sections: [
                      {
                        title: '📋 Main',
                        rows: [
                          {
                            title: '🔰 View All',
                            description: 'See every available module',
                            id: 'view_all'
                          },
                          {
                            title: '⬇️ Downloader',
                            description: 'Download media and files',
                            id: 'downloader'
                          },
                          {
                            title: '👥 Group Tools',
                            description: 'Manage group settings',
                            id: 'group_tools'
                          }
                        ]
                      }
                    ]
                  })
                }
              ]
            })
          })
        }
      }
    }, {});

    await sock.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id
    });
    return;
  }

  // Handle list/menu interactions
  if (selectedId) {
    switch (selectedId) {
      case 'view_all':
        await sock.sendMessage(
          m.from,
          { text: '🔰 Here is the full menu:\n/command1\n/command2\n...' },
          { quoted: m }
        );
        break;
      case 'downloader':
        await sock.sendMessage(
          m.from,
          { text: '⬇️ Use /ytmp3, /ytmp4, /tiktok, /igstory, etc.' },
          { quoted: m }
        );
        break;
      case 'group_tools':
        await sock.sendMessage(
          m.from,
          { text: '👥 Group commands: /linkgroup, /setname, /setdesc...' },
          { quoted: m }
        );
        break;
      default:
        await sock.sendMessage(m.from, { text: 'Unknown option 😕' }, { quoted: m });
    }
  }
            }
