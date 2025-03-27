import config from '../../config.cjs';
import axios from 'axios';
import cheerio from 'cheerio';

const fDroidSearch = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'f-droid') return;

    const query = text || 'termux'; // Default search term

    // Show searching indicator
    await m.reply('🔍 Searching F-Droid repository...');

    const apps = await searchFDroid(query);
    if (apps.length === 0) {
      return m.reply('❌ No apps found for your query');
    }

    let message = `*F-Droid Search Results* (${query})\n\n`;
    apps.slice(0, 5).forEach((app, index) => { // Limit to 5 results
      message += `*${index + 1}. ${app.title}*\n` +
                 `[Download APK](${app.apkUrl})\n` +
                 `[Icon](${app.imageUrl})\n\n`;
    });

    if (apps.length > 5) {
      message += `Showing 5 of ${apps.length} results`;
    }

    // Send results with thumbnail of first app
    await gss.sendMessage(m.from, {
      image: { url: apps[0].imageUrl },
      caption: message,
      footer: `F-Droid Search | ${config.BOT_NAME}`,
      templateButtons: apps.slice(0, 3).map(app => ({
        index: `${apps.indexOf(app) + 1}`,
        quickReplyButton: {
          displayText: `📲 ${app.title}`,
          id: `!fdroid-dl ${app.apkUrl}`
        }
      }))
    }, { quoted: m });

  } catch (error) {
    console.error('F-Droid Error:', error);
    m.reply('❌ An error occurred while searching F-Droid');
  }
};

async function searchFDroid(query) {
  const url = `https://search.f-droid.org/?q=${encodeURIComponent(query)}&lang=en`;
  
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const apps = [];
    
    $('.package-header').each((index, element) => {
      const title = $(element).find('.package-name').text().trim();
      const apkUrl = `https://f-droid.org${$(element).attr('href')}`;
      const imageUrl = $(element).find('.package-icon img').attr('src') || 
                      'https://f-droid.org/assets/ic_repo_app_default.png';
      
      apps.push({ title, apkUrl, imageUrl });
    });
    
    return apps;
  } catch (error) {
    console.error('Search Error:', error);
    return [];
  }
}

export default fDroidSearch;
