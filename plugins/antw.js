// antibad.js
const config = require("../config");

// Anti-Bad Words System
module.exports = {
  event: "body",
  async handler(conn, m, store, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) {
    try {
      const badWords = ["wtf", "mia", "xxx", "fuck", 'sex', "huththa", "pakaya", 'ponnaya', "hutto"];

      // Skip if not group or from admin/bot-admin
      if (!isGroup || isAdmins || !isBotAdmins || config.ANTI_BAD_WORD !== "true") {
        return;
      }

      const messageText = body.toLowerCase();
      const containsBadWord = badWords.some(word => messageText.includes(word));

      if (containsBadWord) {
        // 1. Delete the offensive message
        await conn.sendMessage(from, { delete: m.key }, { quoted: m });
        
        // 2. Send warning
        await conn.sendMessage(from, { 
          text: `⚠️ @${sender.split('@')[0]} - Bad words not allowed!\nMessage deleted`,
          mentions: [sender]
        }, { quoted: m });
      }
    } catch (error) {
      console.error("AntiBad Error:", error);
    }
  }
};
