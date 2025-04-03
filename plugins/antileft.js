import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../../config.cjs';

const antiLeft = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
    const text = m.body?.slice(prefix.length).trim().split(' ') || [];
    const cmd = text[0]?.toLowerCase();
    const subCmd = text[1]?.toLowerCase();

    // Command handler with cage design
    if (cmd === 'antileft') {
        if (!m.isGroup) {
            await m.reply('╭━━━〔 *USAGE* 〕━━━╮\n┃\n┃ *This command only*\n┃ *works in groups!*\n╰━━━━━━━━━━━━━━━━━━━━╯');
            return;
        }

        if (!m.isAdmin && m.sender !== ownerJid) {
            await m.reply('╭━━━〔 *PERMISSION* 〕━━━╮\n┃\n┃ *Only admins can*\n┃ *use this command!*\n╰━━━━━━━━━━━━━━━━━━━━╯');
            return;
        }

        try {
            // Toggle anti-left setting
            if (subCmd === 'on' || subCmd === 'off') {
                const newStatus = subCmd === 'on';
                // Store group setting (in practice you'd save this to a database)
                Matrix.groupSettings = Matrix.groupSettings || {};
                Matrix.groupSettings[m.chat] = Matrix.groupSettings[m.chat] || {};
                Matrix.groupSettings[m.chat].antiLeft = newStatus;

                const response = newStatus ? 
                    '╭━━━〔 *ANTI-LEFT* 〕━━━╮\n┃\n┃ *STATUS: ENABLED ✅*\n┃\n┃ Members who leave will\n┃ be automatically readded\n╰━━━━━━━━━━━━━━━━━━━━╯' : 
                    '╭━━━〔 *ANTI-LEFT* 〕━━━╮\n┃\n┃ *STATUS: DISABLED ❌*\n┃\n┃ Members can leave\n┃ without restriction\n╰━━━━━━━━━━━━━━━━━━━━╯';

                await m.reply(response);
                await m.React(newStatus ? '✅' : '❌');
                return;
            }

            // Show help if no valid subcommand
            await m.reply(`
╭━━━〔 ⚙️ ANTI-LEFT 〕━━━╮
┃
┃ *COMMAND USAGE:*
┃
┃╭──────────────────
┃│ • ${prefix}antileft on
┃│   - Enable protection
┃│
┃│ • ${prefix}antileft off
┃│   - Disable protection
┃╰──────────────────
┃
┃ *CURRENT STATUS:*
┃ ${Matrix.groupSettings?.[m.chat]?.antiLeft ? '✅ ACTIVE' : '❌ INACTIVE'}
╰━━━━━━━━━━━━━━━━━━━━╯`);
            await m.React('ℹ️');
        } catch (error) {
            console.error('AntiLeft Command Error:', error);
            await m.React('❌');
        }
        return;
    }

    // Handle group leave events
    Matrix.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            try {
                // Check if it's a leave action and anti-left is enabled for this group
                if (update.action === 'remove' && 
                    Matrix.groupSettings?.[update.id]?.antiLeft) {
                    
                    const participant = update.participants?.[0];
                    if (!participant) continue;

                    // Get group metadata
                    const groupMetadata = await Matrix.groupMetadata(update.id);
                    if (!groupMetadata) continue;

                    // Re-add the participant
                    await Matrix.groupParticipantsUpdate(
                        update.id,
                        [participant],
                        'add'
                    );

                    // Send notification
                    const user = participant.split('@')[0];
                    await Matrix.sendMessage(update.id, {
                        text: `╭━━━〔 *ANTI-LEFT* 〕━━━╮\n┃\n┃ *@${user} tried to leave*\n┃ *but was brought back!*\n┃\n┃ *No one escapes!* 😈\n╰━━━━━━━━━━━━━━━━━━━━╯`,
                        mentions: [participant]
                    });
                }
            } catch (error) {
                console.error('AntiLeft Enforcement Error:', error);
            }
        }
    });
};

export default antiLeft;
