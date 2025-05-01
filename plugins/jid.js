import config from "../config.cjs";

const getJid = async (m, gss) => {
  try {
    const body = m.body?.toLowerCase().trim();

    // Command: getjid <group-link> or getjid <number>
    if (body.startsWith('!getjid ')) {
      if (m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("❌ Owner-only command");
      }

      const input = m.body.slice(8).trim();
      
      // Get Group JID from invite link
      if (input.includes('chat.whatsapp.com')) {
        const code = input.split('/').pop();
        try {
          const groupInfo = await gss.groupGetInviteInfo(code);
          const jid = groupInfo.id;
          await m.reply(`📌 Group JID: ${jid}\n\n📛 Title: ${groupInfo.subject}`);
          
          // Optional: Join group to verify
          // await gss.groupAcceptInvite(code);
        } catch (e) {
          await m.reply(`⚠️ Error getting group info: ${e.message}`);
        }
      } 
      // Get User JID from number
      else if (/^\d+$/.test(input)) {
        const jid = `${input}@s.whatsapp.net`;
        await m.reply(`👤 User JID: ${jid}`);
        
        // Optional: Verify existence
        // try {
        //   const profile = await gss.profilePictureUrl(jid, 'image');
        //   await m.reply({ image: { url: profile } });
        // } catch (e) {
        //   await m.reply("ℹ️ Profile not available");
        // }
      } else {
        await m.reply("❌ Invalid input\n\nUsage:\n!getjid <group-link>\nOR\n!getjid <phone-number>");
      }
    }
  } catch (error) {
    console.error("GetJID Error:", error);
    m.reply("⚠️ Command failed - check console");
  }
};

export default getJid;
