import config from '../config.cjs';
import fetch from 'node-fetch';

const downloadCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Helper function to fetch JSON responses from an API
  const fetchJson = async (url) => {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching JSON:", error);
      throw error;
    }
  };

  // Command: Instagram Download
  if (cmd === 'ig' || cmd === 'insta' || cmd === 'instagram') {
    try {
      if (!text || !text.startsWith('http')) {
        return m.reply('❌ Please provide a valid Instagram link.');
      }

      await Matrix.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

      const data = await fetchJson(`https://api.davidcyriltech.my.id/instagram?url=${encodeURIComponent(text)}`);

      if (!data || data.status !== 200 || !data.downloadUrl) {
        return m.reply('⚠️ Failed to fetch Instagram video. Please check the link and try again.');
      }

      await Matrix.sendMessage(m.from, {
        video: { url: data.downloadUrl },
        mimetype: 'video/mp4',
        caption: '📥 *Instagram Video Downloaded Successfully!*'
      }, { quoted: m });

    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: Twitter Download
  if (cmd === 'twitter' || cmd === 'tweet' || cmd === 'twdl') {
    try {
      if (!text || !text.startsWith('https://')) {
        return m.reply('❌ Please provide a valid Twitter URL.');
      }

      await Matrix.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

      const data = await fetchJson(`https://www.dark-yasiya-api.site/download/twitter?url=${encodeURIComponent(text)}`);

      if (!data || !data.status || !data.result) {
        return m.reply('⚠️ Failed to retrieve Twitter video. Please check the link and try again.');
      }

      const { desc, thumb, video_sd, video_hd } = data.result;

      const caption = `╭━━━〔 *TWITTER DOWNLOADER* 〕━━━⊷\n`
        + `┃▸ *Description:* ${desc || 'No description'}\n`
        + `╰━━━⪼\n\n`
        + `📹 *Download Options:*\n`
        + `1️⃣ *SD Quality*\n`
        + `2️⃣ *HD Quality*\n`
        + `🎵 *Audio Options:*\n`
        + `3️⃣ *Audio*\n`
        + `4️⃣ *Document*\n`
        + `5️⃣ *Voice*\n\n`
        + `📌 *Reply with the number to download your choice.*`;

      const sentMsg = await Matrix.sendMessage(m.from, {
        image: { url: thumb },
        caption: caption
      }, { quoted: m });

      // Note: Handling message replies for options (1-5) requires a separate event listener setup,
      // which depends on Matrix's event system. Below is a placeholder comment for where you'd implement it.
      // For brevity, I’ve omitted it, as your original code uses `conn.ev.on`, which may differ in Matrix.
      // If you need this, please clarify Matrix's event handling mechanism.
      // Example: Matrix.on('message', async (msg) => { /* Handle reply logic for 1-5 */ });

    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: MediaFire Download
  if (cmd === 'mediafire' || cmd === 'mfire') {
    try {
      if (!text) {
        return m.reply('❌ Please provide a valid MediaFire link.');
      }

      await Matrix.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

      const data = await fetchJson(`https://www.dark-yasiya-api.site/download/mfire?url=${encodeURIComponent(text)}`);

      if (!data || !data.status || !data.result || !data.result.dl_link) {
        return m.reply('⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.');
      }

      const { dl_link, fileName, fileType } = data.result;
      const file_name = fileName || 'mediafire_download';
      const mime_type = fileType || 'application/octet-stream';

      await Matrix.sendMessage(m.from, { react: { text: '⬆️', key: m.key } });

      const caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n`
        + `┃▸ *File Name:* ${file_name}\n`
        + `┃▸ *File Type:* ${mime_type}\n`
        + `╰━━━⪼\n\n`
        + `📥 *Downloading your file...*`;

      await Matrix.sendMessage(m.from, {
        document: { url: dl_link },
        mimetype: mime_type,
        fileName: file_name,
        caption: caption
      }, { quoted: m });

    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: APK Download
  if (cmd === 'apk') {
    try {
      if (!text) {
        return m.reply('❌ Please provide an app name to search.');
      }

      await Matrix.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

      const data = await fetchJson(`http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}/limit=1`);

      if (!data || !data.datalist || !data.datalist.list.length) {
        return m.reply('⚠️ No results found for the given app name.');
      }

      const app = data.datalist.list[0];
      const appSize = (app.size / 1048576).toFixed(2); // Convert bytes to MB

      const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷\n`
        + `┃ 📦 *Name:* ${app.name}\n`
        + `┃ 🏋 *Size:* ${appSize} MB\n`
        + `┃ 📦 *Package:* ${app.package}\n`
        + `┃ 📅 *Updated On:* ${app.updated}\n`
        + `┃ 👨‍💻 *Developer:* ${app.developer.name}\n`
        + `╰━━━━━━━━━━━━━━━┈⊷\n`
        + `> *Marisel*`;

      await Matrix.sendMessage(m.from, { react: { text: '⬆️', key: m.key } });

      await Matrix.sendMessage(m.from, {
        document: { url: app.file.path_alt },
        fileName: `${app.name}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: caption
      }, { quoted: m });

      await Matrix.sendMessage(m.from, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }

  // Command: Google Drive Download
  if (cmd === 'gdrive') {
    try {
      if (!text) {
        return m.reply('❌ Please provide a valid Google Drive link.');
      }

      await Matrix.sendMessage(m.from, { react: { text: '⬇️', key: m.key } });

      const data = await fetchJson(`https://api.fgmods.xyz/api/downloader/gdrive?url=${encodeURIComponent(text)}&apikey=mnp3grlZ`);

      if (!data.result || !data.result.downloadUrl) {
        return m.reply('⚠️ No download URL found. Please check the link and try again.');
      }

      await Matrix.sendMessage(m.from, { react: { text: '⬆️', key: m.key } });

      await Matrix.sendMessage(m.from, {
        document: { url: data.result.downloadUrl },
        mimetype: data.result.mimetype || 'application/octet-stream',
        fileName: data.result.fileName || 'gdrive_download',
        caption: '*𝖊𝖑𝖎𝖆𝖐𝖎𝖒 𝖝𝖒𝖉*'
      }, { quoted: m });

      await Matrix.sendMessage(m.from, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.error("Error occurred:", error);
      m.reply('❌ An error occurred while processing your request. Please try again later.');
    }
  }
};

export default downloadCommand;
