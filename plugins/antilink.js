import config from "../config.cjs";

const antilinkDB = new Map(); // Temporary in-memory storage

const antiLink = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    if (cmd === "antilink on") {
      if (!m.isGroup) return m.reply("*Command reservd for group only*\n\n> *Try it on a group*");
      
      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Command for admins only*\n\n> *Request for admin Role*");
      }

      antilinkDB.set(m.from, true);
      return m.reply("*Anti-Link is now Activated for this group.*\n\n> *Be warned Do not send links.*");
    }

    if (cmd === "antilink off") {
      if (!m.isGroup) return m.reply("*Command only gor groups!*\n\n> *Please try it on groups*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Only Marisel Can Disable Antilink!*\n\n> *Smile in Pain*");
      }

      antilinkDB.delete(m.from);
      return m.reply("*Anti-Link is now Disabled for this group.*\n\n> *Ill be back soon*");
    }

    // **🔹 AUTO-DETECT LINKS AND DELETE THEM**
    if (antilinkDB.get(m.from)) {
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      if (linkRegex.test(m.body)) {
        await gss.sendMessage(m.from, { delete: m.key });
        return m.reply(`*Links are not allowed in this group!*\n\n> *Marisel*`);
      }
    }
  } catch (error) {
    console.error("Error in Anti-Link:", error);
    m.reply("*⚠️ An error occurred while processing Anti-Link.*\n\n> *Please try again later*");
  }
};

export default antiLink;
