import axios from 'axios';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

const Pair = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['pair', 'code', 'paircode'];

  if (validCommands.includes(cmd)) {
    if (!text) return m.reply(`Hello *_${m.pushName}_*,\nHere's Example Usage: *${prefix}pair 25575259xxxx*`);

    try {
      await m.React('🕘');
      await m.reply('A moment, generating your pair code...');

      const phoneNumber = text.trim();
      if (!phoneNumber.match(/^\d+$/)) {
        return m.reply('Please provide a valid phone number (digits only)');
      }

      const apiUrl = `https://botto2-608d38531298.herokuapp.com/code?number=${encodeURIComponent(phoneNumber)}`;
      const response = await axios.get(apiUrl);
      const result = response.data;

      if (result && result.code) {
        const pairCode = result.code;

        let buttons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "ᴄᴏᴘʏ ᴄᴏᴅᴇ",
              id: "copy_code",
              copy_code: pairCode
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "ᴅᴇᴘʟᴏʏ ɴᴏᴡ",
              url: "https://deploying-green.vercel.app/"
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "MAIN MENU",
              id: ".menu"
            })
          }
        ];

        let msg = generateWAMessageFromContent(m.from, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                  text: `╭─────────────━┈⊷
│ *ᴘᴀɪʀ ᴄᴏᴅᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ*
╰─────────────━┈⊷

*ᴄᴏᴅᴇ:* ${pairCode}

Use this code in WhatsApp:
Linked Devices > Link a Device`
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: "> *ᴍᴀᴅᴇ ʙʏ ᴍᴀʀɪsᴇᴋ*"
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: false
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: buttons
                })
              })
            }
          }
        }, {});

        await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
          messageId: msg.key.id
        });

        await m.React('✅');
      } else {
        throw new Error('Invalid response from pairing API');
      }
    } catch (error) {
      console.error('Error getting pair code:', error.message);
      m.reply('Error generating pair code. Please try again later.');
      await m.React('❌');
    }
  }
};

export default Pair;
