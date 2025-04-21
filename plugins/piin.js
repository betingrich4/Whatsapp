import axios from 'axios';
import config from '../../config.cjs';

const pinterestDownloader = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'pindl') return;

    if (!text) {
      return m.reply(
        `❌ *Please provide a Pinterest video link*\n\n` +
        `*Usage:* ${prefix}pindl <pinterest-url>\n` +
        `*Example:* ${prefix}pindl https://www.pinterest.com/pin/695102523772320948`
      );
    }

    // Show processing message
    const waitMsg = await m.reply('🔄 Please wait while I process your request...\nFollow me on Instagram: instagram.com/noureddine_ouafy');

    // Fetch Pinterest media
    const { medias, title } = await fetchPinterestMedia(text);

    if (!medias || !Array.isArray(medias)) {
      throw new Error('Failed to retrieve media. Please try again with a valid URL.');
    }

    // Find the best quality MP4
    const mp4 = medias.filter(v => v.extension === 'mp4');
    const bestQuality = mp4.length > 0 ? mp4[0] : medias[0];

    if (!bestQuality) {
      throw new Error('No downloadable media found for the provided link.');
    }

    // Delete wait message
    await gss.sendMessage(m.from, { delete: waitMsg.key });

    // Send the media
    await gss.sendMessage(m.from, {
      video: { url: bestQuality.url },
      caption: `*${title}*\nQuality: ${bestQuality.quality || 'N/A'}\nSize: ${formatFileSize(bestQuality.size)}`,
      footer: config.BOT_NAME
    }, { quoted: m });

  } catch (error) {
    console.error('Pinterest Download Error:', error);
    
    // Clean up wait message if exists
    if (waitMsg) {
      await gss.sendMessage(m.from, { delete: waitMsg.key });
    }
    
    m.reply(`❌ Failed to download Pinterest media\nError: ${error.message}`);
  }
};

async function fetchPinterestMedia(url) {
  try {
    const apiEndpoint = 'https://pinterestdownloader.io/frontendService/DownloaderService';
    const { data } = await axios.get(apiEndpoint, { params: { url } });
    
    if (!data?.medias) {
      throw new Error('Invalid API response structure');
    }
    
    return data;
  } catch (error) {
    console.error('Pinterest API Error:', error);
    throw new Error('Failed to fetch data from Pinterest. Please try again later.');
  }
}

function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) return 'Unknown size';
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, exponent)).toFixed(2)} ${units[exponent]}`;
}

export default pinterestDownloader;
