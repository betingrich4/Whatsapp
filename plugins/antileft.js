import config from "../config.cjs";

const antiLeftDB = new Map(); // To store group settings

const antileft = async (m, gss) => {
  try {
    // Handle group participants update (member leave)
    if (m.type === 'group-participants-update' && m.action === 'remove') {
      const groupId = m.from;
      
      // Check if anti-leave is enabled for this group
      if (antiLeftDB.get(groupId)) {
        const removedParticipants = m.participants;
        
        // Re-add each removed participant
        for (const participant of removedParticipants) {
          try {
            await gss.groupParticipantsUpdate(
              groupId,
              [participant],
              'add'
            );
            
            // Notify the group
            await gss.sendMessage(
              groupId,
              { 
                text: `@${participant.split('@')[0]} tried to leave but was brought back! 😈\n\n` +
                      `*Anti-leave is active in this group!*`
              },
              { mentions: [participant] }
            );
          } catch (error) {
            console.error(`Failed to re-add ${participant}:`, error);
          }
        }
      }
    }

    // Command to enable anti-leave
    if (m.body?.toLowerCase() === 'antileft on') {
      if (!m.isGroup) return m.reply("*This command only works in groups!*");
      
      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Only admins can enable anti-leave!*");
      }

      antiLeftDB.set(m.from, true);
      return m.reply("*Anti-leave is now activated!*\n\n" +
                    "> Members who leave will be automatically re-added.");
    }

    // Command to disable anti-leave
    if (m.body?.toLowerCase() === 'antileft off') {
      if (!m.isGroup) return m.reply("*This command only works in groups!*");
      
      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin) {
        return m.reply("*Only admins can disable anti-leave!*");
      }

      antiLeftDB.delete(m.from);
      return m.reply("*Anti-leave has been disabled.*\n\n" +
                    "> Members can now leave freely.");
    }

    // Command to check status
    if (m.body?.toLowerCase() === 'antileft status') {
      if (!m.isGroup) return m.reply("*This command only works in groups!*");
      
      const status = antiLeftDB.get(m.from) ? "ACTIVE 🟢" : "INACTIVE 🔴";
      return m.reply(`*Anti-leave status:* ${status}`);
    }

  } catch (error) {
    console.error("Error in AntiLeft:", error);
    m.reply("*⚠️ An error occurred in AntiLeft module.*");
  }
};

export default antileft;
