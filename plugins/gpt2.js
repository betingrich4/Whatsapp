import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import config from '../../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const chatHistoryFile = path.resolve(__dirname, '../gpt2_history.json');

const gpt2SystemPrompt = "You are a knowledgeable AI assistant.";

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

const gpt2 = async (m, Matrix) => {
    const chatHistory = await readChatHistoryFromFile();
    const text = m.body.toLowerCase();

    if (text === "/forget") {
        await deleteChatHistory(chatHistory, m.sender);
        await Matrix.sendMessage(m.from, { text: 'Conversation deleted successfully' }, { quoted: m });
        return;
    }

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const prompt = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['gpt2'];

    if (validCommands.includes(cmd)) {
        if (!prompt) {
            await Matrix.sendMessage(m.from, { text: 'Please give me a prompt' }, { quoted: m });
            return;
        }

        try {
            const senderChatHistory = chatHistory[m.sender] || [];
            const messages = [
                { role: "system", content: gpt2SystemPrompt },
                ...senderChatHistory,
                { role: "user", content: prompt }
            ];

            await m.React("💻");

            // ✅ Updated API Endpoint
            const apiUrl = `https://api.siputzx.my.id/api/ai/gpt-2-chat?content=${encodeURIComponent(prompt)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            const answer = responseData.data;

            await updateChatHistory(chatHistory, m.sender, { role: "user", content: prompt });
            await updateChatHistory(chatHistory, m.sender, { role: "assistant", content: answer });

            const codeMatch = answer.match(/```([\s\S]*?)```/);

            if (codeMatch) {
                const code = codeMatch[1];

                await Matrix.sendMessage(m.from, { text: `🔹 *Here's your code snippet:* \n\n\`\`\`${code}\`\`\`` }, { quoted: m });
            } else {
                await Matrix.sendMessage(m.from, { text: answer }, { quoted: m });
            }

            await m.React("✅");
        } catch (err) {
            await Matrix.sendMessage(m.from, { text: "Something went wrong, please try again." }, { quoted: m });
            console.error('Error fetching response from GPT-2 API:', err);
            await m.React("❌");
        }
    }
};

export default gpt2;
