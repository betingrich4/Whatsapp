import config from "../config.cjs";

const stealthMode = async (m, gss) => {
  try {
    // Check if message is from you (owner) in a locked group
    if (m.sender === config.OWNER_NUMBER + '@s.whatsapp.net' && m.isGroup) {
      const groupMetadata = await gss.groupMetadata(m.from);
      const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;
      
      // If group is locked and you're not admin
      if (!isAdmin && m.body.startsWith('!send ')) {
        const message = m.body.replace('!send ', '');
        
        // Send as bot (stealth mode)
        await gss.sendMessage(
          m.from, 
          { 
            text: message,
            footer: "Bot Notification",
            templateButtons: [
              {
                urlButton: {
                  displayText: "View Docs",
                  url: "https://drive.google.com"
                }
              }
            ]
          }
        );
        
        // Delete your original message
        await gss.sendMessage(m.from, { delete: m.key });
        return;
      }
    }
  } catch (error) {
    console.error("Stealth Error:", error);
  }
};

export default stealthMode;
