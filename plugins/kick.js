import config from '../../config.cjs';

const pendingActions = new Map(); // Stores pending kick-all requests

const kick = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // Check if this is a confirmation for pending kick-all
    if (pendingActions.has(m.from) && ['1', '2'].includes(text)) {
      const action = pendingActions.get(m.from);
      if (text === '2') {
        pendingActions.delete(m.from);
        return m.reply('*Kick-all operation cancelled.*');
      }

      // Proceed with kick-all (text === '1')
      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants
        .filter(p => !p.admin && p.id !== botNumber) // Exclude admins and bot
        .map(p => p.id);

      await gss.groupParticipantsUpdate(m.from, participants, 'remove');
      pendingActions.delete(m.from);
      return m.reply(`Successfully removed all non-admin members from ${groupMetadata.subject}`);
    }

    // Normal kick command
    const validCommands = ['kick', 'remove', 'kickall'];
    if (!validCommands.includes(cmd)) return;

    if (!m.isGroup) return m.reply("*THIS COMMAND CAN ONLY BE USED IN GROUPS*");
    
    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

    if (!botAdmin) return m.reply("*BOT MUST BE AN ADMIN TO USE THIS COMMAND*");
    if (!senderAdmin) return m.reply("*YOU MUST BE AN ADMIN TO USE THIS COMMAND*");

    // Kick-all functionality
    if (cmd === 'kickall') {
      pendingActions.set(m.from, { timestamp: Date.now() });
      return m.reply(
        `*Alert this will remove All non-admin members!*\n\n` +
        `*1.* Confirm\n` +
        `*2.* Cancel\n\n` +
        `*You have 30 seconds to confirm*`
      );

      // Auto-cancel after 30 seconds
      setTimeout(() => {
        if (pendingActions.has(m.from)) {
          pendingActions.delete(m.from);
        }
      }, 30000);
    }

    // Normal kick command (individual users)
    if (!m.mentionedJid) m.mentionedJid = [];
    if (m.quoted?.participant) m.mentionedJid.push(m.quoted.participant);

    const users = m.mentionedJid.length > 0
      ? m.mentionedJid
      : text.replace(/[^0-9]/g, '').length > 0
      ? [text.replace(/[^0-9]/g, '') + '@s.whatsapp.net']
      : [];

    if (users.length === 0) {
      return m.reply("*PLEASE MENTION OR QUOTE A USER TO KICK*");
    }

    const validUsers = users.filter(u => !participants.find(p => p.id === u)?.admin); // Don't kick admins
    await gss.groupParticipantsUpdate(m.from, validUsers, 'remove');
    const kickedNames = validUsers.map(user => `@${user.split("@")[0]}`);
    m.reply(`*USERS ${kickedNames} KICKED FROM ${groupMetadata.subject}*`);
    
  } catch (error) {
    console.error('Kick Error:', error);
    pendingActions.delete(m.from); // Cleanup on error
    m.reply('❌ An error occurred while processing the command.');
  }
};

export default kick;
