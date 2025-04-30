import Tesseract from 'tesseract.js';
import translate from 'translate-google-api';
import { writeFile, unlink } from 'fs/promises';

const supportedLanguages = {
    'af': 'Afrikaans', 'sq': 'Albanian', 'am': 'Amharic', 'ar': 'Arabic',
    // ... (keep your existing language list)
    'zu': 'Zulu'
};

const translateCommand = async (m, sock, config) => {
    const prefixMatch = m.body.match(/^[\\/!#.]/);
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');

    const validCommands = ['translate', 'trt', 'trans'];

    if (validCommands.includes(cmd)) {
        try {
            // Handle language list request
            if (args[0]?.toLowerCase() === 'list') {
                let langList = "📚 *Supported Languages*\n\n";
                for (const [code, name] of Object.entries(supportedLanguages)) {
                    langList += `*${code}* - ${name}\n`;
                }
                return await sock.sendMessage(m.from, { text: langList }, { quoted: m });
            }

            const targetLang = args[0]?.toLowerCase();
            
            // Validate target language
            if (!targetLang || !supportedLanguages[targetLang]) {
                return await sock.sendMessage(m.from, { 
                    text: `❌ Invalid or missing language code. Use ${prefix}trt list to see supported languages.`
                }, { quoted: m });
            }

            // Check if we're replying to a message
            if (!m.quoted) {
                return await sock.sendMessage(m.from, { 
                    text: `ℹ️ Reply to a message with "${prefix}trt en" to translate it to English\nOr use "${prefix}trt list" to see supported languages`
                }, { quoted: m });
            }

            // Handle quoted message translation
            if (m.quoted.mtype === 'imageMessage') {
                try {
                    const media = await m.quoted.download();
                    const filePath = `./${Date.now()}.jpg`;
                    await writeFile(filePath, media);

                    await sock.sendMessage(m.from, { text: '🔍 Extracting text from image...' }, { quoted: m });
                    
                    const { data: { text: extractedText } } = await Tesseract.recognize(
                        filePath, 
                        'auto', // Auto-detect language
                        { logger: progress => console.log(progress) }
                    );

                    await unlink(filePath).catch(console.error);

                    if (!extractedText.trim()) {
                        return await sock.sendMessage(m.from, { 
                            text: '❌ No text found in the image. Please try with a clearer image.'
                        }, { quoted: m });
                    }

                    const [translatedText] = await translate(extractedText, { to: targetLang });
                    
                    return await sock.sendMessage(m.from, { 
                        text: `🌍 Translation to ${supportedLanguages[targetLang]}:\n\n${translatedText}` 
                    }, { quoted: m });
                    
                } catch (error) {
                    console.error("Image translation error:", error);
                    return await sock.sendMessage(m.from, { 
                        text: '❌ Failed to process image. Please try again with a clearer image.'
                    }, { quoted: m });
                }
            }
            else if (m.quoted.text) {
                try {
                    const originalText = m.quoted.text;
                    const [translatedText] = await translate(originalText, { to: targetLang });
                    
                    return await sock.sendMessage(m.from, { 
                        text: `🌍 Translation to ${supportedLanguages[targetLang]}:\n\n${translatedText}` 
                    }, { quoted: m });
                    
                } catch (error) {
                    console.error("Text translation error:", error);
                    return await sock.sendMessage(m.from, { 
                        text: '❌ Failed to translate text. Please try again.'
                    }, { quoted: m });
                }
            }
            else {
                return await sock.sendMessage(m.from, { 
                    text: '❌ Unsupported message type. I can only translate text or images containing text.'
                }, { quoted: m });
            }

        } catch (error) {
            console.error("Translation command error:", error);
            return await sock.sendMessage(m.from, { 
                text: '❌ An error occurred during translation. Please try again later.'
            }, { quoted: m });
        }
    }
};

export default translateCommand;
