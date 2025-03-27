import axios from 'axios';
import cheerio from 'cheerio';
import config from '../../config.cjs';

const pinterestSearch = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'pinterest') return;

    if (!text) {
      return m.reply(
        `❌ *Please enter a search query*\n\n` +
        `*Usage:* ${prefix}pinterest <query>\n` +
        `*Example:* ${prefix}pinterest cute cats`
      );
    }

    // Show processing message
    const waitMsg = await m.reply('🔍 Searching Pinterest...\nFollow me on Instagram: instagram.com/noureddine_ouafy');

    // Search Pinterest
    const result = await searchPinterest(text);

    if (!result.status) {
      throw new Error(result.message);
    }

    // Delete wait message
    await gss.sendMessage(m.from, { delete: waitMsg.key });

    // Send results
    for (const [index, pin] of result.pins.entries()) {
      await gss.sendMessage(m.from, {
        image: { url: pin.image },
        caption: `*${pin.title}*\n\n` +
                 `*URL:* ${pin.pin_url}\n` +
                 `*Author:* ${pin.uploader.full_name} (@${pin.uploader.username})\n\n` +
                 `${index + 1}/${result.pins.length}`,
        footer: config.BOT_NAME
      }, { quoted: m });
      
      // Add small delay between sending pins
      if (index < result.pins.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (error) {
    console.error('Pinterest Search Error:', error);
    
    // Clean up wait message if exists
    if (waitMsg) {
      await gss.sendMessage(m.from, { delete: waitMsg.key });
    }
    
    m.reply(`❌ Failed to search Pinterest\nError: ${error.message}`);
  }
};

// Pinterest API configuration
const PINTEREST_CONFIG = {
  baseUrl: 'https://www.pinterest.com',
  searchEndpoint: '/resource/BaseSearchResource/get/',
  headers: {
    'accept': 'application/json, text/javascript, */*, q=0.01',
    'referer': 'https://www.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-app-version': 'a9522f',
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/[username]/[slug].js',
    'x-requested-with': 'XMLHttpRequest'
  }
};

async function getPinterestCookies() {
  try {
    const response = await axios.get(PINTEREST_CONFIG.baseUrl);
    const cookies = response.headers['set-cookie']?.map(c => c.split(';')[0].trim()).join('; ');
    return cookies || null;
  } catch (error) {
    console.error('Cookie Fetch Error:', error);
    return null;
  }
}

async function searchPinterest(query) {
  try {
    const cookies = await getPinterestCookies();
    if (!cookies) {
      return { status: false, message: "Failed to get required cookies" };
    }

    const params = {
      source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
      data: JSON.stringify({
        options: {
          isPrefetch: false,
          query,
          scope: "pins",
          bookmarks: [""],
          page_size: 10
        },
        context: {}
      }),
      _: Date.now()
    };

    const { data } = await axios.get(
      `${PINTEREST_CONFIG.baseUrl}${PINTEREST_CONFIG.searchEndpoint}`,
      {
        headers: { ...PINTEREST_CONFIG.headers, cookie: cookies },
        params
      }
    );

    const results = data.resource_response?.data?.results?.filter(v => v.images?.orig) || [];
    if (results.length === 0) {
      return { status: false, message: "No results found for your query" };
    }

    return {
      status: true,
      pins: results.map(result => ({
        id: result.id,
        title: result.title || "Untitled",
        description: result.description || "No description",
        pin_url: `https://pinterest.com/pin/${result.id}`,
        image: result.images.orig.url,
        uploader: {
          username: result.pinner?.username || 'unknown',
          full_name: result.pinner?.full_name || 'Unknown User',
          profile_url: `https://pinterest.com/${result.pinner?.username || ''}`
        }
      }))
    };

  } catch (error) {
    console.error('Search Error:', error);
    return { status: false, message: "Error searching Pinterest" };
  }
}

export default pinterestSearch;
