import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const chatHistoryFile = path.resolve(__dirname, '../gpt_history.json');

const systemPrompt = "You are a helpful assistant providing detailed and friendly responses.";

async function readChatHistory() {
    try {
        const data = await fs.readFile(chatHistoryFile, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

async function writeChatHistory(chatHistory) {
    try {
        await fs.writeFile(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
    } catch (err) {
        console.error('Error writing chat history:', err);
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
    await writeChatHistory(chatHistory);
}

async function deleteChatHistory(chatHistory, sender) {
    delete chatHistory[sender];
    await writeChatHistory(chatHistory);
}

export default {
    command: ['gpt'],
    operate: async ({ m, reply, text }) => {
        if (!text) return reply("*Please ask a question*");

        const chatHistory = await readChatHistory();
        
        if (text === "/forget") {
            await deleteChatHistory(chatHistory, m.sender);
            return reply("*Conversation history deleted!*");
        }

        try {
            const senderHistory = chatHistory[m.sender] || [];
            const messages = [
                { role: "system", content: systemPrompt },
                ...senderHistory,
                { role: "user", content: text }
            ];

            const apiUrl = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(systemPrompt)}&content=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (!result.status || !result.data) {
                return reply("*Please try again later or try another command!*");
            }

            const answer = result.data;
            await updateChatHistory(chatHistory, m.sender, { role: "user", content: text });
            await updateChatHistory(chatHistory, m.sender, { role: "assistant", content: answer });

            // Check for code snippets
            const codeMatch = answer.match(/```([\s\S]*?)```/);
            if (codeMatch) {
                return reply(`🔹 *Here's your code snippet:* \n\n\`\`\`${codeMatch[1]}\`\`\``);
            }

            reply(answer);
        } catch (error) {
            console.error('Error fetching response from GPT API:', error);
            reply("An error occurred while fetching the response from GPT API.");
        }
    }
};
