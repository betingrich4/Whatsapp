import config from '../config.js';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { writeFile, unlink } from 'fs/promises';

const supportedLanguages = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  sw: 'Swahili',
  yo: 'Yoruba',
  ha: 'Hausa',
  ig: 'Igbo',
  zu: 'Zulu',
  af: 'Afrikaans',
  am: 'Amharic',
  he: 'Hebrew',
  tr: 'Turkish',
  nl: 'Dutch',
  sv: 'Swedish',
  fi: 'Finnish',
  da: 'Danish',
  no: 'Norwegian',
  pl: 'Polish',
  uk: 'Ukrainian',
  ko: 'Korean',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
};

const translateCommand = async (m, sock, { from }) => {
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');

  const validCommands = ['translate', 'trt'];

  if (!validCommands.includes(cmd)) return;

  try {
    await sock.sendPresenceUpdate('composing', m.from);

    // Show language menu if no arguments
    if (args.length === 0) {
      let langMenu = `📚 ${config.CHANNEL_NAME || 'Marisel'} Translation Menu\n\n`;
      langMenu += '🌍 Available Languages:\n\n';

      // Group languages in columns
      const langEntries = Object.entries(supportedLanguages);
      const chunkSize = Math.ceil(langEntries.length / 3);

      for (let i = 0; i < 3; i++) {
        const chunk = langEntries.slice(i * chunkSize, (i + 1) * chunkSize);
        chunk.forEach(([code, name]) => {
          langMenu += `• ${code} - ${name}\n`;
        });
        if (i < 2) langMenu += '\n';
      }

      langMenu += `\nUsage: ${prefix}trt <target_lang> (reply to text/image)\n`;
      langMenu += `Or: ${prefix}trt <source_lang>:<target_lang> (e.g., ${prefix}trt es:en)`;

      return await sock.sendMessage(
        m.from,
        {
          text: langMenu,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.CHANNEL_JID,
              newsletterName: config.CHANNEL_NAME,
              serverMessageId: 143,
            },
          },
        },
        { quoted: m }
      );
    }

    // Parse source and target language
    let sourceLang = 'en'; // Default source language
    let targetLang = args[0].toLowerCase();

    if (targetLang.includes(':')) {
      // User specified source:target (e.g., "es:en")
      [sourceLang, targetLang] = targetLang.split(':');
    }

    // Validate language codes
    if (!supportedLanguages[targetLang]) {
      return await sock.sendMessage(
        m.from,
        {
          text: `❌ Invalid target language code. Use ${prefix}trt to see available languages.`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.CHANNEL_JID,
              newsletterName: config.CHANNEL_NAME,
              serverMessageId: 143,
            },
          },
        },
        { quoted: m }
      );
    }
    if (!supportedLanguages[sourceLang]) {
      return await sock.sendMessage(
        m.from,
        {
          text: `❌ Invalid source language code. Use ${prefix}trt to see available languages.`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.CHANNEL_JID,
              newsletterName: config.CHANNEL_NAME,
              serverMessageId: 143,
            },
          },
        },
        { quoted: m }
      );
    }

    // Translation function
    const translateText = async (text, sourceLang, targetLang) => {
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=${sourceLang}|${targetLang}`,
        { timeout: 5000 }
      );
      const translatedText = response.data.responseData.translatedText;
      if (!translatedText) {
        throw new Error('No translation returned from MyMemory API.');
      }
      return translatedText;
    };

    // Require quoted message
    if (!m.quoted) {
      return await sock.sendMessage(
        m.from,
        {
          text: `❌ Please reply to a text or image message with ${prefix}trt <target_lang> or ${prefix}trt <source_lang>:<target_lang>`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.CHANNEL_JID,
              newsletterName: config.CHANNEL_NAME,
              serverMessageId: 143,
            },
          },
        },
        { quoted: m }
      );
    }

    let responseMessage = '';
    if (m.quoted.mtype === 'imageMessage') {
      // Handle image
      const media = await m.quoted.download();
      if (!media) throw new Error('Failed to download media.');

      const filePath = `./temp_${Date.now()}.jpg`;
      await writeFile(filePath, media);

      try {
        const {
          data: { text: extractedText },
        } = await Tesseract.recognize(filePath, 'eng+swa+hi+es+fr', {
          logger: (m) => console.log(m),
        });

        if (!extractedText?.trim()) {
          throw new Error('No text found in image.');
        }

        const translatedText = await translateText(
          extractedText,
          sourceLang,
          targetLang
        );

        responseMessage = `🌍 ${config.CHANNEL_NAME || 'Marisel'} Translation (${
          supportedLanguages[targetLang]
        })\n\n`;
        responseMessage += `📸 From Image:\n${extractedText}\n\n`;
        responseMessage += `🔠 Translated:\n${translatedText}`;
        if (sourceLang === 'en') {
          responseMessage += `\n\nNote: Assumed source language is English. Use ${prefix}trt <source_lang>:<target_lang> for other languages.`;
        }
      } finally {
        await unlink(filePath).catch(console.error);
      }
    } else if (m.quoted.text) {
      // Handle text
      const translatedText = await translateText(
        m.quoted.text,
        sourceLang,
        targetLang
      );

      responseMessage = `🌍 ${config.CHANNEL_NAME || 'Marisel'} Translation (${
        supportedLanguages[targetLang]
      })\n\n`;
      responseMessage += `📝 Original:\n${m.quoted.text}\n\n`;
      responseMessage += `🔠 Translated:\n${translatedText}`;
      if (sourceLang === 'en') {
        responseMessage += `\n\nNote: Assumed source language is English. Use ${prefix}trt <source_lang>:<target_lang> for other languages.`;
      }
    } else {
      return await sock.sendMessage(
        m.from,
        {
          text: `❌ Please reply to a text or image message.`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.CHANNEL_JID,
              newsletterName: config.CHANNEL_NAME,
              serverMessageId: 143,
            },
          },
        },
        { quoted: m }
      );
    }

    return await sock.sendMessage(
      m.from,
      {
        text: responseMessage,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.CHANNEL_JID,
            newsletterName: config.CHANNEL_NAME,
            serverMessageId: 143,
          },
        },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error('Translation error:', error);
    await sock.sendMessage(
      m.from,
      {
        text: `❌ Error: ${error.message || 'Translation failed. Try again.'}`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.CHANNEL_JID,
            newsletterName: config.CHANNEL_NAME,
            serverMessageId: 143,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default translateCommand;
