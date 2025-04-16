import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import { writeFile, unlink } from 'fs/promises';
import config from '../config.cjs';

const MAX_FILE_SIZE_MB = 200;
const newsletterJid = config.CHANNEL_JID || '120363299029326322@newsletter';
const newsletterName = config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑";

async function uploadMedia(buffer) {
  try {
    const { ext } = await fileTypeFromBuffer(buffer);
    const bodyForm = new FormData();
    bodyForm.append("fileToUpload", buffer, "file." + ext);
    bodyForm.append("reqtype", "fileupload");

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: bodyForm,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}: ${res.statusText}`);
    }

    const data = await res.text();
    return data;
  } catch (error) {
    console.error("Error during media upload:", error);
    throw new Error('Failed to upload media');
  }
}

const tourl = async (m, bot) => {
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const validCommands = ['tourl', 'geturl', 'upload', 'url'];

  if (validCommands.includes(cmd)) {
    if (!m.quoted || !['imageMessage', 'videoMessage', 'audioMessage'].includes(m.quoted.mtype)) {
      return m.reply({
        text: `Send/Reply/Quote an image, video, or audio to upload \n*${prefix + cmd}*`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName,
            serverMessageId: 143
          }
        }
      });
    }

    try {
      const loadingMessages = [
        "*「▰▰▰▱▱▱▱▱▱▱」*",
        "*「▰▰▰▰▱▱▱▱▱▱」*",
        "*「▰▰▰▰▰▱▱▱▱▱」*",
        "*「▰▰▰▰▰▰▱▱▱▱」*",
        "*「▰▰▰▰▰▰▰▱▱▱」*",
        "*「▰▰▰▰▰▰▰▰▱▱」*",
        "*「▰▰▰▰▰▰▰▰▰▱」*",
        "*「▰▰▰▰▰▰▰▰▰▰」*",
      ];

      const loadingMessageCount = loadingMessages.length;
      let currentMessageIndex = 0;

      const { key } = await bot.sendMessage(m.from, { 
        text: loadingMessages[currentMessageIndex],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName,
            serverMessageId: 143
          }
        }
      }, { quoted: m });

      const loadingInterval = setInterval(() => {
        currentMessageIndex = (currentMessageIndex + 1) % loadingMessageCount;
        bot.sendMessage(m.from, { 
          text: loadingMessages[currentMessageIndex],
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: newsletterName,
              serverMessageId: 143
            }
          }
        }, { quoted: m, messageId: key });
      }, 500);

      const media = await m.quoted.download();
      if (!media) throw new Error('Failed to download media.');

      const fileSizeMB = media.length / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        clearInterval(loadingInterval);
        return m.reply({
          text: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: newsletterName,
              serverMessageId: 143
            }
          }
        });
      }

      const mediaUrl = await uploadMedia(media);
      clearInterval(loadingInterval);
      
      await bot.sendMessage(m.from, { 
        text: '✅ Upload complete!',
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName,
            serverMessageId: 143
          }
        }
      }, { quoted: m });

      const mediaType = getMediaType(m.quoted.mtype);
      const commonContext = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJid,
          newsletterName: newsletterName,
          serverMessageId: 143
        }
      };

      if (mediaType === 'audio') {
        await bot.sendMessage(m.from, { 
          text: `*Media Upload Successful*\n\n🔹 *Type:* Audio\n🔹 *URL:* ${mediaUrl}\n\n_Shared via ${newsletterName}_`,
          contextInfo: commonContext
        }, { quoted: m });
      } else {
        await bot.sendMessage(m.from, { 
          [mediaType]: { url: mediaUrl },
          caption: `*Media Upload Successful*\n\n🔹 *Type:* ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}\n🔹 *URL:* ${mediaUrl}\n\n_Shared via ${newsletterName}_`,
          contextInfo: commonContext
        }, { quoted: m });
      }

    } catch (error) {
      console.error('Error processing media:', error);
      await bot.sendMessage(m.from, { 
        text: '⚠️ Error processing media. Please try again.',
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName,
            serverMessageId: 143
          }
        }
      }, { quoted: m });
    }
  }
};

const getMediaType = (mtype) => {
  switch (mtype) {
    case 'imageMessage':
      return 'image';
    case 'videoMessage':
      return 'video';
    case 'audioMessage':
      return 'audio';
    default:
      return null;
  }
};

export default tourl;
