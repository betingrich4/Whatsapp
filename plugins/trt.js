import config from '../config.js';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { writeFile, unlink } from 'fs/promises';

const supportedLanguages = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
    'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi', 'sw': 'Swahili',
    'yo': 'Yoruba', 'ha': 'Hausa', 'ig': 'Igbo', 'zu': 'Zulu',
    'af': 'Afrikaans', 'am': 'Amharic', 'he': 'Hebrew', 'tr': 'Turkish',
    'nl': 'Dutch', 'sv': 'Swedish', 'fi': 'Finnish', 'da': 'Danish',
    'no': 'Norwegian', 'pl': 'Polish', 'uk': 'Ukrainian', 'ko': 'Korean',
    'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay'
};

const translateCommand = async (m, sock, { from }) => {
    const prefixMatch = m.body.match(/^[\\/!#.]/);
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');

    const validCommands = ['translate', 'trt'];

    if (!validCommands.includes(cmd)) return;

    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', m.from);

        // Show language menu if no arguments
        if (args.length === 0) {
            let langMenu = `📚 *${config.CHANNEL_NAME || "Marisel"} Translation Menu*\n\n`;
            langMenu += "🌍 Available Languages:\n\n";
            
            // Group languages in columns
            const langEntries = Object.entries(supportedLanguages);
            const chunkSize = Math.ceil(langEntries.length / 3);
            
            for (let i = 0; i < 3; i++) {
                const chunk = langEntries.slice(i * chunkSize, (i + 1) * chunkSize);
                chunk.forEach(([code, name]) => {
                    langMenu += `• *${code}* - ${name}\n`;
                });
                if (i < 2) langMenu += "\n";
            }
            
            langMenu += `\nUsage: ${prefix}trt <code> <text>\nExample: ${prefix}trt es Hello`;
            
            return await sock.sendMessage(m.from, { 
                text: langMenu,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.CHANNEL_JID || '120363299029326322@newsletter',
                        newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                        serverMessageId: 143
                    }
                }
            });
        }

        const targetLang = args[0].toLowerCase();
        
        // Validate language code
        if (!supportedLanguages[targetLang]) {
            return await sock.sendMessage(m.from, { 
                text: `❌ Invalid language code. Use ${prefix}trt to see available languages.`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.CHANNEL_JID,
                        newsletterName: config.CHANNEL_NAME,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
        }

        // MyMemory API translation function
        const translateText = async (text) => {
            const response = await axios.get(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`,
                { timeout: 5000 }
            );
            return response.data.responseData.translatedText;
        };

        // Handle quoted messages
        if (m.quoted) {
            // Handle image
            if (m.quoted.mtype === 'imageMessage') {
                const media = await m.quoted.download();
                const filePath = `./temp_${Date.now()}.jpg`;
                await writeFile(filePath, media);

                try {
                    const { data: { text: extractedText } } = await Tesseract.recognize(
                        filePath,
                        'eng+',
                        { logger: m => console.log(m) }
                    );

                    if (!extractedText?.trim()) {
                        throw new Error('No text found in image');
                    }

                    const translatedText = await translateText(extractedText);
                    
                    return await sock.sendMessage(m.from, { 
                        text: `🌍 *${config.CHANNEL_NAME} Translation* (${supportedLanguages[targetLang]})\n\n` +
                              `📸 *From Image*:\n${extractedText}\n\n` +
                              `🔠 *Translated*:\n${translatedText}`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: config.CHANNEL_JID,
                                newsletterName: config.CHANNEL_NAME,
                                serverMessageId: 143
                            }
                        }
                    }, { quoted: m });
                } finally {
                    await unlink(filePath).catch(console.error);
                }
            }
            // Handle text
            else if (m.quoted.text) {
                const translatedText = await translateText(m.quoted.text);
                
                return await sock.sendMessage(m.from, { 
                    text: `🌍 *${config.CHANNEL_NAME} Translation* (${supportedLanguages[targetLang]})\n\n` +
                          `📝 *Original*:\n${m.quoted.text}\n\n` +
                          `🔠 *Translated*:\n${translatedText}`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: config.CHANNEL_JID,
                            newsletterName: config.CHANNEL_NAME,
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            }
        }
        // Handle direct text
        else if (args.length > 1) {
            const text = args.slice(1).join(' ');
            const translatedText = await translateText(text);
            
            return await sock.sendMessage(m.from, { 
                text: `🌍 *${config.CHANNEL_NAME} Translation* (${supportedLanguages[targetLang]})\n\n${translatedText}`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.CHANNEL_JID,
                        newsletterName: config.CHANNEL_NAME,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Translation error:', error);
        await sock.sendMessage(m.from, { 
            text: `❌ Error: ${error.message || 'Translation failed'}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.CHANNEL_JID,
                    newsletterName: config.CHANNEL_NAME,
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    }
};

export default translateCommand;
