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

  const targetLang = args[0];
  const text = args.slice(1).join(' ');

  // Validate target language
  if (!targetLang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(targetLang)) {
    await sock.sendMessage(
      m.from,
      { text: 'Please provide a valid language code (e.g., "en", "es", "hi").' },
      { quoted: m }
    );
    return;
  }

  // MyMemory API translation function
  const translateText = async (textToTranslate, targetLang) => {
    try {
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          textToTranslate
        )}&langpair=en|${targetLang}`
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
          } = await Tesseract.recognize(filePath, 'eng', {
            logger: (info) => console.log(info),
          });

          if (!extractedText.trim()) {
            throw new Error('No text detected in the image.');
          }

          // Translate extracted text
          const translatedText = await translateText(extractedText, targetLang);

          const responseMessage = `${targetLang}:\n\n${translatedText}`;
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
        const translatedText = await translateText(quotedText, targetLang);

        const responseMessage = `${targetLang}:\n\n${translatedText}`;
        await sock.sendMessage(m.from, { text: responseMessage }, { quoted: m });
      }
    } else if (text && targetLang) {
      // Handle direct text translation
      const translatedText = await translateText(text, targetLang);

      const responseMessage = `${targetLang}:\n\n${translatedText}`;
      await sock.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } else {
      const responseMessage =
        'Usage: /translate <target_lang> <text>\nExample: /translate en कैसे हो भाई\nOr reply to an image/text message with /translate <target_lang>';
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
