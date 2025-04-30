import Tesseract from 'tesseract.js';
import axios from 'axios';
import { writeFile, unlink } from 'fs/promises';

const translateCommand = async (m, sock, config) => {
  // Command parsing
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');

  const validCommands = ['translate', 'trt'];

  if (!validCommands.includes(cmd)) return;

  // Parse source and target language
  let sourceLang = 'en'; // Default source language
  let targetLang = args[0];

  if (targetLang && targetLang.includes(':')) {
    // User specified source:target (e.g., "es:en")
    [sourceLang, targetLang] = targetLang.split(':');
  }

  // Validate target language
  if (!targetLang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(targetLang)) {
    await sock.sendMessage(
      m.from,
      { text: 'Please provide a valid target language code (e.g., "en", "es", "sw").' },
      { quoted: m }
    );
    return;
  }

  // Validate source language
  if (!sourceLang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(sourceLang)) {
    await sock.sendMessage(
      m.from,
      { text: 'Please provide a valid source language code (e.g., "en", "es", "sw").' },
      { quoted: m }
    );
    return;
  }

  const text = args.slice(1).join(' ');

  // MyMemory API translation function
  const translateText = async (textToTranslate, sourceLang, targetLang) => {
    try {
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          textToTranslate
        )}&langpair=${sourceLang}|${targetLang}`,
        { timeout: 5000 }
      );
      const translatedText = response.data.responseData.translatedText;
      if (!translatedText) {
        throw new Error('No translation returned from MyMemory API.');
      }
      return translatedText;
    } catch (error) {
      throw new Error(
        `MyMemory API error: ${
          error.response?.data?.responseStatus || error.message
        }`
      );
    }
  };

  try {
    if (m.quoted) {
      if (m.quoted.mtype === 'imageMessage') {
        // Handle image translation (OCR)
        const media = await m.quoted.download();
        if (!media) throw new Error('Failed to download media.');

        const filePath = `./temp_${Date.now()}.png`;
        await writeFile(filePath, media);

        try {
          // Perform OCR
          const {
            data: { text: extractedText },
          } = await Tesseract.recognize(filePath, 'eng+swa+hi+es+fr', {
            logger: (info) => console.log(info),
          });

          if (!extractedText.trim()) {
            throw new Error('No text detected in the image.');
          }

          // Translate extracted text
          const translatedText = await translateText(
            extractedText,
            sourceLang,
            targetLang
          );

          const responseMessage = `${targetLang}:\n\n${translatedText}${
            sourceLang === 'en'
              ? '\n\nNote: Assumed source language is English. Use <source_lang>:<target_lang> for other languages (e.g., es:en).'
              : ''
          }`;
          await sock.sendMessage(m.from, { text: responseMessage }, { quoted: m });
        } finally {
          // Clean up temporary file
          await unlink(filePath).catch((err) =>
            console.error('Failed to delete temp file:', err)
          );
        }
      } else if (m.quoted.text) {
        // Handle quoted text translation
        const quotedText = m.quoted.text;
        const translatedText = await translateText(
          quotedText,
          sourceLang,
          targetLang
        );

        const responseMessage = `${targetLang}:\n\n${translatedText}${
          sourceLang === 'en'
            ? '\n\nNote: Assumed source language is English. Use <source_lang>:<target_lang> for other languages (e.g., es:en).'
            : ''
        }`;
        await sock.sendMessage(m.from, { text: responseMessage }, { quoted: m });
      }
    } else if (text && targetLang) {
      // Handle direct text translation
      const translatedText = await translateText(text, sourceLang, targetLang);

      const responseMessage = `${targetLang}:\n\n${translatedText}${
        sourceLang === 'en'
          ? '\n\nNote: Assumed source language is English. Use <source_lang>:<target_lang> for other languages (e.g., es:en).'
          : ''
      }`;
      await sock.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } else {
      const responseMessage =
        'Usage: /translate <target_lang> <text>\nExample: /translate en कैसे हो भाई\n' +
        'Or: /translate <source_lang>:<target_lang> <text>\nExample: /translate hi:en कैसे हो भाई\n' +
        'Or reply to an image/text message with /translate <target_lang> or /translate <source_lang>:<target_lang>';
      await sock.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    }
  } catch (error) {
    console.error('Translation error:', error);
    await sock.sendMessage(
      m.from,
      { text: `Error: ${error.message || 'Failed to process translation.'}` },
      { quoted: m }
    );
  }
};

export default translateCommand;
