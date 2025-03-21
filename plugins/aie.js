import config from '../config.cjs';
import fetch from 'node-fetch';

const aiCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Helper function to fetch AI responses from an API
  const fetchAiResponse = async (url, query) => {
    try {
      const response = await fetch(`${url}${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching AI response:", error);
      throw error;
    }
  };

  // Handler for GPT-4 Turbo (custom AI)
  const handleGpt4Command = async (query) => {
    try {
      const model = 'gpt-4-turbo-2024-04-09';
      const messages = [
        { role: 'user', content: query },
        { role: 'system', content: 'You are an assistant in WhatsApp. You are called Slayer. You respond to user commands.' }
      ];

      const response = await ai.generate(model, messages);
      return response;
    } catch (error) {
      console.error("Error generating GPT-4 response:", error);
      throw error;
    }
  };

  // Command: Chat
  if (cmd === 'chat') {
    try {
      if (!text) {
        return m.reply('⚠️ Please provide a query. Example: *chat How\'s the weather today?*');
      }

      const response = await fetchAiResponse("https://bk9.fun/ai/chataibot?q=", text);

      const message = `*Chat AI Response*\n\n${response}`;

      await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: Lucky
  if (cmd === 'slayer') {
    try {
      if (!text) {
        return m.reply('Please provide a query. Example: *Hi, how are you?*');
      }

      const response = await fetchAiResponse("https://bk9.fun/ai/BK93?BK9=you%20are%20zoro%20from%20one%20piece&q=", text);

      const message = `*Slayer Ai Response*\n\n${response}`;

      await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: GPT
  if (cmd === 'gpt') {
    try {
      if (!text) {
        return m.reply('Please provide a query. Example: *gpt Hi, how are you?*');
      }

      const response = await fetchAiResponse("https://bk9.fun/ai/llama?q=", text);

      const message = `*GPT AI Response*\n\n${response}`;

      await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: Gemini
  if (cmd === 'gemni') {
    try {
      if (!text) {
        return m.reply('Please provide a query. Example: *gemni Hi, how are you?*');
      }

      const response = await fetchAiResponse("https://bk9.fun/ai/gemini?q=", text);

      const message = `*Gemini AI Response*\n\n${response}`;

      await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: GPT-4 Turbo (Custom AI)
  if (cmd === 'ilma') {
    try {
      if (!text) {
        return m.reply('Please provide a query. Example: *ilma How does GPT-4 work?*');
      }

      const response = await handleGpt4Command(text);

      const message = `🤖 *GPT-4 Turbo Response*\n\n${response}`;

      await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }
};

export default aiCommand;
