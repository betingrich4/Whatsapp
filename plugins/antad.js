import config from "../config.cjs";

const remoteGroups = new Map(); // { groupJid: true }

const remoteControl = async (m, gss) => {
  try {
    // Only process private messages from owner
    if (!m.isGroup && m.sender === config.OWNER_NUMBER + '@s.whatsapp.net') {
      const [command, groupJid, ...messageParts] = m.body.split(' ');
      const message = messageParts.join(' ');

      if (command === '!post') {
        // Verify this is a group you control
        if (remoteGroups.has(groupJid)) {
          await gss.sendMessage(
            groupJid,
            { 
              text: `📢 ${message}`,
              footer: "Official Notification",
              buttons: [
                { buttonId: '!viewdocs', buttonText: { displayText: 'View Documents' }, type: 1 }
              ]
            }
          );
          return m.reply(`✅ Message sent to group ${groupJid}`);
        }
      }
      
      if (command === '!register') {
        remoteGroups.set(groupJid, true);
        return m.reply(`✅ Group ${groupJid} registered for remote posting`);
      }
    }
  } catch (error) {
    console.error("Remote Error:", error);
  }
};

export default remoteControl;
