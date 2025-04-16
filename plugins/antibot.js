import config from "../config.cjs";

const antibotDB = new Map(); // Temporary in-memory storage

const antibot = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();
    const newsletterJid = config.CHANNEL_JID || '120363299029326322@newsletter';

    // Enable antibot
    if (cmd === "antibot on") {
      if (!m.isGroup) {
        return m.reply({
          text: "*Command reserved for groups only*\n\n> *Try it in a group*",
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
              serverMessageId: 143
            }
          }
        });
      }

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply({
          text: "*Command for admins only*\n\n> *Request admin role*",
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
              serverMessageId: 143
            }
          }
        });
      }

      antibotDB.set(m.from, true);
      return m.reply({
        text: "*Antibot is now activated for this group.*\n\n> *Be warned: Do not use bot commands.*",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
            serverMessageId: 143
          }
        }
      });
    }

    // Disable antibot
    if (cmd === "antibot off") {
      if (!m.isGroup) {
        return m.reply({
          text: "*Command only for groups!*\n\n> *Please try it in a group*",
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
              serverMessageId: 143
            }
          }
        });
      }

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply({
          text: "*Only admins can disable antibot!*\n\n> *Smile in pain*",
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
              serverMessageId: 143
            }
          }
        });
      }

      antibotDB.delete(m.from);
      return m.reply({
        text: "*Antibot is now disabled for this group.*\n\n> *I'll be back soon*",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
            serverMessageId: 143
          }
        }
      });
    }

    // Auto-detect and handle bot commands
    if (antibotDB.get(m.from)) {
      const botCommandRegex = /\.menu|\.help|\.ping|\.play|\.owner|\.img|\.repo|\.sc|\.start|\.command/gi;
      if (botCommandRegex.test(m.body)) {
        const groupMetadata = await gss.groupMetadata(m.from);
        const participants = groupMetadata.participants;
        const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

        if (senderAdmin) return;

        await gss.sendMessage(m.from, { delete: m.key });

        await m.reply({
          text: `*Bot commands are not allowed in this group!*\n\n> *This is your first warning.*`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
              serverMessageId: 143
            }
          }
        });

        const warnedUsers = antibotDB.get(m.from + "_warned") || new Set();
        if (warnedUsers.has(m.sender)) {
          await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
          return m.reply({
            text: `*${m.sender.split('@')[0]} has been removed for using bot commands.*`,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                serverMessageId: 143
              }
            }
          });
        } else {
          warnedUsers.add(m.sender);
          antibotDB.set(m.from + "_warned", warnedUsers);
        }
      }
    }
  } catch (error) {
    console.error("Error in Antibot:", error);
    m.reply({
      text: "*⚠️ An error occurred while processing Antibot.*\n\n> *Please try again later*",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: config.CHANNEL_JID || '120363299029326322@newsletter',
          newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
          serverMessageId: 143
        }
      }
    });
  }
};

export default antibot;
