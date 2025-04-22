import axios from 'axios';
import config from '../../config.cjs';

const playHandler = async (m, sock) => {
  try {
    if (!m?.from || !m?.body || !sock) {
      console.error('Invalid message or socket object');
      return;
    }

    const prefix = config.PREFIX || '!';
    const body = m.body || '';

    if (!body.startsWith(prefix)) return;

    const cmd = body.slice(prefix.length).split(' ')[0].toLowerCase();
    const text = body.slice(prefix.length + cmd.length).trim();

    if (cmd === "play") {
      if (!text) {
        await sock.sendMessage(m.from, { text: "🎶 Oops! Please provide a song name or artist! 💖" }, { quoted: m });
        await m.React('❌');
        return;
      }

      // Initial reaction and status message
      await m.React('🫆');
      const processingMsg = await sock.sendMessage(
        m.from, 
        { text: "*Searching for song...*" }, 
        { quoted: m }
      );

      try {
        // Update status to processing
        await sock.sendMessage(
          m.from, 
          { 
            text: "*Processing song...*",
            edit: processingMsg.key 
          }
        );

        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.status || !data?.result || !data.result.download_url) {
          await sock.sendMessage(
            m.from, 
            { 
              text: "❌ Uh-oh! No results found for that song! 😔",
              edit: processingMsg.key 
            }
          );
          await m.React('❌');
          return;
        }

        // Update status to downloading
        await sock.sendMessage(
          m.from, 
          { 
            text: "*Downloading song...*",
            edit: processingMsg.key 
          }
        );

        const { title = 'Unknown', download_url, thumbnail, duration = '0:00' } = data.result;

        const messagePayload = {
          audio: { url: download_url },
          mimetype: "audio/mpeg",
          ptt: false,
          caption: `ᴘʟᴀʏɪɴɢ ɴᴏᴡ: *${title}*\n⏱ Duration: ${duration}\n↻ ◁ II ▷ ↺`,
          thumbnail: thumbnail,
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363398040175935@newsletter',
              newsletterName: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
              serverMessageId: -1,
            },
            externalAdReply: {
              title: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
              body: "ᴘʟᴀʏɪɴɢ ɴᴏᴡ ↻ ◁ II ▷ ↺",
              thumbnailUrl: 'https://files.catbox.moe/ec3umb.jpg',
              sourceUrl: 'https://whatsapp.com/channel/0029Vajvy2kEwEjwAKP4SI0x',
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        };

        try {
          // Send the audio
          await sock.sendMessage(m.from, messagePayload, { quoted: m });
          await m.React('🎵');
          
          // Delete processing messages and command
          await sock.sendMessage(
            m.from, 
            { 
              delete: processingMsg.key 
            }
          );
          await sock.sendMessage(
            m.from, 
            { 
              delete: m.key 
            }
          );

        } catch (audioError) {
          console.error("Error sending audio:", audioError);
          await sock.sendMessage(
            m.from, 
            { 
              text: "❌ Oops! Failed to send the audio! 😓",
              edit: processingMsg.key 
            }
          );
          await m.React('❌');
        }

      } catch (error) {
        console.error("Error in play command:", error);
        await sock.sendMessage(
          m.from, 
          { 
            text: "❌ Oh no! Something went wrong! 😢",
            edit: processingMsg.key 
          }
        );
        await m.React('❌');
      }
    }
  } catch (error) {
    console.error('Critical error in playHandler:', error);
    await sock.sendMessage(m.from, { text: "❌ Uh-oh! An unexpected error occurred! 😣 try song2 " }, { quoted: m });
    await m.React('❌');
  }
};

export default playHandler;
