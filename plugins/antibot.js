add newsletter jid to this too 
import config from "../config.cjs";

const antibotDB = new Map(); // Temporary in-memory storage

const antibot = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable antibot
    if (cmd === "antibot on") {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*\n\n> *Try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Command for admins only*\n\n> *Request admin role*");
      }

      antibotDB.set(m.from, true);
      return m.reply("*Antibot is now activated for this group.*\n\n> *Be warned: Do not use bot commands.*");
    }

    // Disable antibot
    if (cmd === "antibot off") {
      if (!m.isGroup) return m.reply("*Command only for groups!*\n\n> *Please try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Only admins can disable antibot!*\n\n> *Smile in pain*");
      }

      antibotDB.delete(m.from);
      return m.reply("*Antibot is now disabled for this group.*\n\n> *I'll be back soon*");
    }

    // **🔹 AUTO-DETECT BOT COMMANDS AND DELETE THEM**
    if (antibotDB.get(m.from)) {
      const botCommandRegex = /\.menu|\.help|\.ping|\.play|\.owner|\.img|\.repo|\.sc|\.start|\.command/gi;
      if (botCommandRegex.test(m.body)) {
        // Get group metadata
        const groupMetadata = await gss.groupMetadata(m.from);
        const participants = groupMetadata.participants;

        // Check if the sender is an admin
        const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

        if (senderAdmin) {
          // If the sender is an admin, do not take any action
          return;
        }

        // Delete the message
        await gss.sendMessage(m.from, { delete: m.key });

        // Warn the user
        await m.reply(`*Bot commands are not allowed in this group!*\n\n> *This is your first warning.*`);

        // Track warned users
        const warnedUsers = antibotDB.get(m.from + "_warned") || new Set();
        if (warnedUsers.has(m.sender)) {
          // Remove the user if they repeat the violation
          await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
          return m.reply(`*${m.sender.split('@')[0]} has been removed for using bot commands.*`);
        } else {
          warnedUsers.add(m.sender);
          antibotDB.set(m.from + "_warned", warnedUsers);
        }
      }
    }
  } catch (error) {
    console.error("Error in Antibot:", error);
    m.reply("*⚠️ An error occurred while processing Antibot.*\n\n> *Please try again later*");
  }
};

export default antibot;
