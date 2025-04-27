// online.js
import config from "../config.cjs";
import chalk from 'chalk';

const onlineCache = new Map(); // { groupJid: { lastChecked: Date, members: Array } }

const online = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Check online members
    if (cmd === "online") {
      if (!m.isGroup) return m.reply("*Command reserved for groups only*\n\n> *Try it in a group*");

      const groupMetadata = await gss.groupMetadata(m.from);
      const senderAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin && m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
        return m.reply("*Command for admins only*\n\n> *Request admin role*");
      }

      const processingMsg = await m.reply("*🔍 Scanning for online members...*\n> This may take 15-20 seconds...");

      const groupData = await gss.groupMetadata(m.from);
      const totalMembers = groupData.participants.length;
      const onlineMembers = new Map();

      // Enhanced presence detection
      const presenceHandler = (json) => {
        for (const id in json.presences) {
          const presence = json.presences[id];
          if (presence?.lastKnownPresence && 
              ['available', 'composing', 'recording', 'online'].includes(presence.lastKnownPresence)) {
            onlineMembers.set(id, {
              lastSeen: Date.now(),
              presence: presence.lastKnownPresence
            });
          }
        }
      };

      // Subscribe to presence updates
      gss.ev.on('presence.update', presenceHandler);
      
      // Request presence updates
      const presencePromises = groupData.participants.map(participant => 
        gss.presenceSubscribe(participant.id)
      );
      await Promise.all(presencePromises);

      // Wait for data collection
      await new Promise(resolve => setTimeout(resolve, 15000));

      // Clean up
      gss.ev.off('presence.update', presenceHandler);

      if (onlineMembers.size === 0) {
        await gss.sendMessage(m.from, { delete: processingMsg.key });
        return m.reply("*⚠️ Couldn't detect any online members*\n> They might be hiding their presence");
      }

      // Prepare and send results
      const onlineArray = Array.from(onlineMembers.keys());
      const onlineList = onlineArray.map((member, index) => 
        `${index + 1}. @${member.split('@')[0]}`
      ).join('\n');

      await gss.sendMessage(m.from, { 
        text: `*🟢 Online Members (${onlineArray.length}/${totalMembers}):*\n\n${onlineList}`,
        mentions: onlineArray
      }, { quoted: m });

      // Delete processing message
      await gss.sendMessage(m.from, { delete: processingMsg.key });

      // Cache results
      onlineCache.set(m.from, {
        lastChecked: Date.now(),
        members: onlineArray
      });
    }
  } catch (error) {
    console.error("Online Check Error:", error);
    m.reply("*⚠️ An error occurred while checking online status*\n> Please try again later");
  }
};

export default online;
