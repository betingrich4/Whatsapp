import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import config from '../../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const chatHistoryFile = path.resolve(__dirname, '../deepseek_history.json');
const newsletterJid = config.CHANNEL_JID || '120363299029326322@newsletter';
const newsletterName = config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑";

const deepSeekSystemPrompt = "You are an intelligent AI assistant.";

async function readChatHistoryFromFile() {
    try {
        const data = await fs.readFile(chatHistoryFile, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

async function writeChatHistoryToFile(chatHistory) {
    try {
        await fs.writeFile(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
    } catch (err) {
        console.error('Error writing chat history to file:', err);
    }
}

async function updateChatHistory(chatHistory, sender, message) {
    if (!chatHistory[sender]) {
        chatHistory[sender] = [];
    }
    chatHistory[sender].push(message);
    if (chatHistory[sender].length > 20) {
        chatHistory[sender].shift();
    }
    await writeChatHistoryToFile(chatHistory);
}

async function deleteChatHistory(chatHistory, userId) {
    delete chatHistory[userId];
    await writeChatHistoryToFile(chatHistory);
}

const deepseek = async (m, Matrix) => {
    const chatHistory = await readChatHistoryFromFile();
    const text = m.body.toLowerCase();

    if (text === "/forget") {
        await deleteChatHistory(chatHistory, m.sender);
        await Matrix.sendMessage(m.from, { 
            text: 'Conversation history deleted successfully',
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: newsletterJid,
                    newsletterName: newsletterName,
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
        return;
    }

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const prompt = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['ai'];

    if (validCommands.includes(cmd)) {
        if (!prompt) {
            await Matrix.sendMessage(m.from, { 
                text: 'Please provide a prompt/question after the command',
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: newsletterJid,
                        newsletterName: newsletterName,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
            return;
        }

        try {
            const senderChatHistory = chatHistory[m.sender] || [];
            const messages = [
                { role: "system", content: deepSeekSystemPrompt },
                ...senderChatHistory,
                { role: "user", content: prompt }
            ];

            await m.React("⏳");

            const apiUrl = `https://api.paxsenix.biz.id/ai/gemini-realtime?text=${encodeURIComponent(prompt)}&session_id=ZXlKaklqb2lZMTg0T0RKall6TTNNek13TVdFNE1qazNJaXdpY2lJNkluSmZNbU01TUdGa05ETmtNVFF3WmpNNU5pSXNJbU5vSWpvaWNtTmZZVE16TURWaE1qTmpNR1ExTnpObFl5Sjk`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }

            const responseData = await response.json();
            let answer = responseData.message;

            await updateChatHistory(chatHistory, m.sender, { role: "user", content: prompt });
            await updateChatHistory(chatHistory, m.sender, { role: "assistant", content: answer });

            const codeMatch = answer.match(/```([\s\S]*?)```/);

            if (codeMatch) {
                const code = codeMatch[1];
                await Matrix.sendMessage(m.from, { 
                    text: `🔹 *Code Response* 🔹\n\n\`\`\`${code}\`\`\``,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: newsletterJid,
                            newsletterName: newsletterName,
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            } else {
                await Matrix.sendMessage(m.from, { 
                    text: answer,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: newsletterJid,
                            newsletterName: newsletterName,
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            }

            await m.React("✅");
        } catch (err) {
            await Matrix.sendMessage(m.from, { 
                text: "⚠️ Error processing your request. Please try again later.",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: newsletterJid,
                        newsletterName: newsletterName,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
            console.error('DeepSeek API Error:', err);
            await m.React("❌");
        }
    }
};

export default deepseek;
