import config from '../config.js';
import Tesseract from 'tesseract.js';
import translate from 'translate-google-api';
import { writeFile, unlink } from 'fs/promises';

const translateCommand = async (m, sock, { from }) => {
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');

  const validCommands = ['translate', 'trt'];

  if (validCommands.includes(cmd)) {
    try {
      // Show typing indicator
      await sock.sendPresenceUpdate('composing', m.from);

      const targetLang = args[0];
      const text = args.slice(1).join(' ');

      if (m.quoted) {
        if (m.quoted.mtype === 'imageMessage') {
          const media = await m.quoted.download();
          if (!media) throw new Error('Failed to download media');

          const filePath = `./${Date.now()}.jpg`;
          await writeFile(filePath, media);

          const { data: { text: extractedText } } = await Tesseract.recognize(
            filePath,
            'eng+',
            { logger: m => console.log(m) }
          );

          await unlink(filePath);
          
          if (!extractedText?.trim()) {
            return await sock.sendMessage(m.from, { 
              text: '❌ No text found in the image' 
            }, { quoted: m });
          }

          const [translatedText] = await translate(extractedText, { to: targetLang });
          return await sock.sendMessage(m.from, { 
            text: `🌍 Translated to ${targetLang}:\n\n${translatedText}` 
          }, { quoted: m });
        }
        else if (m.quoted.text) {
          const [translatedText] = await translate(m.quoted.text, { to: targetLang });
          return await sock.sendMessage(m.from, { 
            text: `🌍 Translated to ${targetLang}:\n\n${translatedText}` 
          }, { quoted: m });
        }
      }
      else if (text && targetLang) {
        const [translatedText] = await translate(text, { to: targetLang });
        return await sock.sendMessage(m.from, { 
          text: `🌍 Translated to ${targetLang}:\n\n${translatedText}` 
        }, { quoted: m });
      }
      else {
        return await sock.sendMessage(m.from, { 
          text: `Usage: ${prefix}trt <lang> <text>\nExample: ${prefix}trt en Hola\nOr reply to a message with ${prefix}trt <lang>` 
        }, { quoted: m });
      }
    } catch (error) {
      console.error('Translate error:', error);
      return await sock.sendMessage(m.from, { 
        text: '❌ Translation failed. Please try again.' 
      }, { quoted: m });
    }
  }
};

export default translateCommand;
