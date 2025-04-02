import config from '../../config.cjs';
import ytSearch from 'yt-search';

const play = async (message, client) => {
    const command = message.body.trim().toLowerCase();
    
    if (command.startsWith('play') || command.startsWith('video')) {
        const query = command.replace(/^(play|video)\s*/, '').trim();
        
        if (!query) {
            return message.reply('❌ *Please provide a search query!*');
        }

        await message.React('⏳');
        
        try {
            const searchResults = await ytSearch(query);
            
            if (!searchResults.videos.length) {
                return message.reply('❌ *No results found!*');
            }

            const video = searchResults.videos[0];
            const caption = `
╭━━━〔 *Demon Slayer Downloader* 〕━━━
┃▸ *Title:* ${video.title}
┃▸ *Duration:* ${video.timestamp}
┃▸ *Channel:* ${video.author.name}
┃▸ *Views:* ${video.views}
╰━━━━━━━━━━━━━━━━━━

📥 *Downloading automatically...*`;

            await client.sendMessage(message.chat, {
                image: { url: video.thumbnail },
                caption: caption
            }, { quoted: message });

            const videoUrl = encodeURIComponent(video.url);
            const videoApis = [
                `https://api.giftedtech.web.id/api/download/dlmp4?url=${videoUrl}`,
                `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`,
                `https://www.dark-yasiya-api.site/download/ytmp4?url=${videoUrl}`,
                `https://apis.giftedtech.web.id/api/download/dlmp4?apikey=gifted&url=${videoUrl}`
            ];

            const audioApis = [
                `https://apis.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`,
                `https://apis.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${videoUrl}`
            ];

            const apisToUse = command.startsWith('video') ? videoApis : audioApis;
            const mediaType = command.startsWith('video') ? 'video' : 'audio';
            const mimeType = command.startsWith('video') ? 'video/mp4' : 'audio/mpeg';
            const successMessage = command.startsWith('video') 
                ? '📥 *Downloaded in Video Format*' 
                : '📥 *Downloaded in Audio Format*';

            let downloadUrl = null;
            
            for (const api of apisToUse) {
                try {
                    const response = await fetch(api);
                    const data = await response.json();
                    
                    if (data.success && data.result?.url) {
                        downloadUrl = data.result.download_url;
                        break;
                    }
                } catch (error) {
                    console.log('❌ API failed:', api);
                }
            }

            if (!downloadUrl) {
                return message.reply('❌ *All download sources failed. Please try again later.*');
            }

            const mediaMessage = {
                [mediaType]: { url: downloadUrl },
                mimetype: mimeType,
                caption: successMessage
            };

            await client.sendMessage(message.chat, mediaMessage, { quoted: message });
            
        } catch (error) {
            console.log('Error:', error);
            return message.reply('❌ *An error occurred while processing your request.*');
        }
    }
};

function hi() {
    console.log('Hello World!');
}

hi();

export default play;
