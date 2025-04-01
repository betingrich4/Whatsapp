import config from '../../config.cjs';

const joelSettings = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "settings") {
    const start = new Date().getTime();
    await m.React('📚');
    const end = new Date().getTime();
    const responseTime = (end - start).toFixed(2);

    // open settings menu
    const responseText = `
╭━━━〔 *ᴏᴡɴᴇʀ sᴇᴛᴛɪɴɢs* 〕━━━┈⊷
┃╭────────────────────
┃│ *ʙᴏᴛ ᴘʀᴇғɪx:* ${config.PREFIX}
┃│ *ʙᴏᴛ ᴍᴏᴅᴇ:* ${config.MODE}
┃│ *ʙᴏᴛ ᴛʜᴇᴍᴇ:* ${config.OWNER_NAME}
┃╰────────────────────
┃╭────────────────────
┃│ *ᴀᴜᴛᴏ sᴇᴛᴛɪɴɢs:*
┃│ • ᴀᴜᴛᴏsᴠɪᴇᴡ: ${config.AUTO_VIEW_STATUS}
┃│ • ᴀᴜᴛᴏsʟɪᴋᴇ: ${config.AUTOLIKE_STATUS}
┃│ • ᴀᴜᴛᴏᴛʏᴘɪɴɢ: ${config.AUTO_TYPING}
┃│ • ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ: ${config.ALWAYS_ONLINE}
┃╰────────────────────
┃╭────────────────────
┃│ *ᴏᴡɴᴇʀ ɪɴғᴏ:*
┃│ • ɴᴀᴍᴇ: ${config.OWNER_NAME}
┃│ • ɴᴜᴍʙᴇʀ: ${config.OWNER_NUMBER}
┃│ • sᴇssɪᴏɴ ɪᴅ: ${config.SESSION_ID}
╰━━━━━━━━━━━━━━━━━━━━┈⊷
`.trim();

    await m.React('✅');

    sock.sendMessage(
      m.from,
      {
        text: responseText,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363317462952356@newsletter',
            newsletterName: "Demon-Slayer",
            serverMessageId: -1,
          },
          forwardingScore: 999,
          externalAdReply: {
            title: "Demon-Slayer",
            body: "Made By Marisel",
            thumbnailUrl: 'https://avatars.githubusercontent.com/u/162905644?v=4',
            sourceUrl: 'https://whatsapp.com/channel/0029Vak2PevK0IBh2pKJPp2K',
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default joelSettings;
