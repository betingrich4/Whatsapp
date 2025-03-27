import axios from 'axios';
import cheerio from 'cheerio';
import config from '../../config.cjs';

const happymodSearch = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const query = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'happymod') return;

    if (!query) {
      return m.reply(
        `❌ *Please enter an app name to search*\n\n` +
        `*Usage:* ${prefix}happymodsearch <app-name>\n` +
        `*Example:* ${prefix}happymodsearch Minecraft`
      );
    }

    // Show processing indicator
    await m.react('⌛');
    const waitMsg = await m.reply('🔍 Searching Happymod...\nFollow me on Instagram: instagram.com/noureddine_ouafy');

    // Search Happymod
    const results = await searchHappymod(query);

    if (results.length === 0) {
      throw new Error('No mods found for your search query');
    }

    // Delete wait message
    await gss.sendMessage(m.from, { delete: waitMsg.key });

    // Prepare and send results
    const resultMessage = `*Happymod Search Results for "${query}"*\n\n` +
      results.slice(0, 15).map((item, index) => (
        `*${index + 1}. ${item.title}*\n` +
        `Rating: ${item.rating || 'Not rated'}\n` +
        `Download: ${item.link}\n\n`
      )).join('');

    await gss.sendMessage(m.from, {
      image: { url: 'https://i.postimg.cc/c6q7zRC8/1741529921037.png' },
      caption: resultMessage,
      footer: config.BOT_NAME
    }, { quoted: m });

    await m.react('✅');

  } catch (error) {
    console.error('Happymod Search Error:', error);
    await m.react('❌');
    
    // Clean up wait message if exists
    if (waitMsg) {
      await gss.sendMessage(m.from, { delete: waitMsg.key });
    }
    
    m.reply(`❌ Failed to search Happymod\nError: ${error.message}`);
  }
};

async function searchHappymod(query) {
  try {
    const url = `https://happymod.com/search.html?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.pdt-app-box').each((i, el) => {
      const title = $(el).find('h3').text().trim();
      const link = 'https://happymod.com' + $(el).find('a').attr('href');
      const rating = $(el).find('span.a-search-num').text().trim() || 'Not rated';

      results.push({ title, link, rating });
    });

    return results;

  } catch (error) {
    console.error('Happymod Scrape Error:', error);
    throw new Error('Failed to fetch data from Happymod');
  }
}

export default happymodSearch;
