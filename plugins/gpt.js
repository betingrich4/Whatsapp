/**
 * AI Chat Handler
 * Created by Jaya ID
 * Uses GPT-4
 * 
 * Please do not remove this watermark.
 */

import axios from 'axios';
import config from '../../config.cjs';

const openaiHandler = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'openai') return;

    if (!text) {
      return m.reply(
        `❌ *Please enter your question*\n\n` +
        `*Usage:* ${prefix}openai <your question>\n` +
        `*Example:* ${prefix}openai hello bot`
      );
    }

    // Show processing indicator
    await m.react('💬');
    const waitMsg = await m.reply('💭 Processing your question...');

    // Prepare context data
    const currentDate = new Date();
    const time = currentDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    const day = currentDate.toLocaleDateString('en', { weekday: 'long' });
    const date = currentDate.toLocaleDateString('en', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const context = `Your name is Demon-Slaywr, created by Marisel. Use casual language and appropriate emojis. Current date: ${date}. Current time: ${time}. Today is ${day}.`;

    // Call OpenAI API
    const response = await callOpenAI(text, context);

    // Delete wait message
    await gss.sendMessage(m.from, { delete: waitMsg.key });

    // Send response
    await gss.sendMessage(m.from, {
      text: `*GPT-4*\n\n> ${response}`,
      thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUgq45nsxxSRPEUMhX3Bgzctxv7VT-ieYmdw&usqp=CAU'
    }, { quoted: m });

    await m.react('🔥');

  } catch (error) {
    console.error('OpenAI Error:', error);
    await m.react('❎');
    
    if (waitMsg) {
      await gss.sendMessage(m.from, { delete: waitMsg.key });
    }
    
    m.reply(`❌ Failed to get response\nError: ${error.message}`);
  }
};

async function callOpenAI(text, context) {
  const response = await axios.post(
    'https://chateverywhere.app/api/chat/',
    {
      model: {
        id: 'gpt-4',
        name: 'GPT-4',
        maxLength: 32000,
        tokenLimit: 8000,
        completionTokenLimit: 5000,
        deploymentName: 'gpt-4'
      },
      messages: [{
        pluginId: null,
        content: text,
        role: 'user'
      }],
      prompt: context,
      temperature: 0.5
    },
    {
      headers: {
        'Accept': '/*/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      }
    }
  );

  return response.data;
}

export default openaiHandler;
