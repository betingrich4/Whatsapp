import config from "../config.cjs";

const antilinkDB = new Map(); // Temporary in-memory storage

const antiLink = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable antilink
    if (cmd === "antilink on") {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*\n\n> *Try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Command for admins only*\n\n> *Request admin role*");
      }

      antilinkDB.set(m.from, true);
      return m.reply("*Anti-Link is now activated for this group.*\n\n> *Be warned: Do not send links.*");
    }

    // Disable antilink
    if (cmd === "antilink off") {
      if (!m.isGroup) return m.reply("*Command only for groups!*\n\n> *Please try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Only admins can disable Anti-Link!*\n\n> *Smile in pain*");
      }

      antilinkDB.delete(m.from);
      return m.reply("*Anti-Link is now disabled for this group.*\n\n> *I'll be back soon*");
    }

    // **🔹 AUTO-DETECT LINKS AND DELETE THEM**
    if (antilinkDB.get(m.from)) {
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      if (linkRegex.test(m.body)) {
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
        await m.reply(`*Links are not allowed in this group!*\n\n> *This is your first warning.*`);

        // Track warned users
        const warnedUsers = antilinkDB.get(m.from + "_warned") || new Set();
        if (warnedUsers.has(m.sender)) {
          // Remove the user if they repeat the violation
          await gss.groupParticipantsUpdate(m.from, [m.sender], 'remove');
          return m.reply(`*${m.sender.split('@')[0]} has been removed for sending links.*`);
        } else {
          warnedUsers.add(m.sender);
          antilinkDB.set(m.from + "_warned", warnedUsers);
        }
      }
    }
  } catch (error) {
    console.error("Error in Anti-Link:", error);
    m.reply("*⚠️ An error occurred while processing Anti-Link.*\n\n> *Please try again later*");
  }
};

export default antiLink;
