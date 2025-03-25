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
    if (!text) {
      return m.reply(`╭─────────────━┈⊷
│ *PAIR CODE HELP*
╰─────────────━┈⊷
Hello *${m.pushName}*,
      
Example Usage: 
*${prefix}pair 254790375710*

╭─────────────━┈⊷
│ [FOLLOW US]
│ (https://deploying-green.vercel.app/)
╰─────────────━┈⊷`);
    }

    try {
      await m.React('🕘');
      const processingMsg = await m.reply('╭─────────────━┈⊷\n│ *GENERATING CODE...*\n╰─────────────━┈⊷');

      const phoneNumber = text.trim();
      if (!phoneNumber.match(/^254\d{9}$/)) {
        await processingMsg.delete();
        return m.reply(`╭─────────────━┈⊷
│ *INVALID NUMBER*
╰─────────────━┈⊷
Please provide a valid Kenyan phone number in format:
*2547XXXXXXXX* (12 digits total)`);
      }

      // Try primary API first
      let apiUrl = `https://botto2-608d38531298.herokuapp.com/code?number=${encodeURIComponent(phoneNumber)}`;
      let response = await axios.get(apiUrl, { timeout: 10000 });
      
      // If primary fails, try fallback API
      if (!response.data?.code) {
        apiUrl = `https://fredietech.onrener.com/code?number=${encodeURIComponent(phoneNumber)}`;
        response = await axios.get(apiUrl, { timeout: 10000 });
      }

      const result = response.data;

      if (result?.code) {
        await processingMsg.delete();
        const pairCode = result.code;

        let buttons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 COPY CODE",
              id: "copy_code",
              copy_code: pairCode
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🔗 FOLLOW US",
              url: "https://deploying-green.vercel.app/"
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
│ *PAIR CODE GENERATED*
╰─────────────━┈⊷

📱 *For Number:* ${phoneNumber}
🔢 *Pair Code:* ${pairCode}

╭─────────────━┈⊷
│ *HOW TO USE*
╰─────────────━┈⊷
1. Open WhatsApp on new phone
2. Go to Settings > Linked Devices
3. Tap "Link a Device"
4. Enter this code when prompted`
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: "> *© 3 MEN ARMY*"
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
        throw new Error('API returned invalid response');
      }
    } catch (error) {
      console.error('Pair code error:', error.message);
      await m.reply(`╭─────────────━┈⊷
│ *ERROR GENERATING CODE*
╰─────────────━┈⊷
We couldn't generate your pair code.

Possible reasons:
• Server is temporarily down
• Invalid phone number format
• Too many requests

Please try again in 5 minutes.`);
      await m.React('❌');
    }
  }
};

export default Pair;
