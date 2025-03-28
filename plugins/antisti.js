import config from '../../config.cjs';

const antiStickerHandler = async (m, gss) => {
    // Only act in groups
    if (!m.isGroup) return;

    const groupSettings = global.db.data.groups[m.chat] || {};
    const botAdmin = await isBotAdmin(gss, m.chat);
    const isAdmin = await isUserAdmin(gss, m);

    // Check if anti-sticker is enabled and bot is admin
    if (!groupSettings.antisticker || !botAdmin) return;

    try {
        // Check if message is a sticker
        if (m.mtype === 'stickerMessage') {
            // Don't delete if sender is admin
            if (isAdmin) return;

            // Delete the sticker
            await gss.sendMessage(m.chat, { 
                delete: { 
                    id: m.key.id, 
                    remoteJid: m.chat, 
                    fromMe: false 
                } 
            });

            // Optional: Send warning
            await gss.sendMessage(m.chat, { 
                text: `Stickers are not allowed here @${m.sender.split('@')[0]}!`,
                mentions: [m.sender]
            }, { quoted: m });
        }
    } catch (error) {
        console.error('AntiSticker Error:', error);
    }
};

// Helper function to check if bot is admin
async function isBotAdmin(gss, chat) {
    const groupMetadata = await gss.groupMetadata(chat);
    const botJid = gss.user.id.split(':')[0] + '@s.whatsapp.net';
    return groupMetadata.participants.find(p => p.id === botJid)?.admin !== undefined;
}

// Helper function to check if user is admin
async function isUserAdmin(gss, m) {
    const groupMetadata = await gss.groupMetadata(m.chat);
    return groupMetadata.participants.find(p => p.id === m.sender)?.admin !== undefined;
}

// Command to toggle anti-sticker
const antiStickerCmd = async (m, gss) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (cmd === 'antisticker') {
        if (!m.isGroup) return m.reply('This command only works in groups');
        
        const botAdmin = await isBotAdmin(gss, m.chat);
        if (!botAdmin) return m.reply('I need to be admin to enable this feature');

        const groupSettings = global.db.data.groups[m.chat] || {};
        groupSettings.antisticker = !groupSettings.antisticker;
        
        global.db.data.groups[m.chat] = groupSettings;
        m.reply(`Anti-sticker mode ${groupSettings.antisticker ? 'enabled' : 'disabled'}`);
    }
};

// Set both handlers
antiStickerHandler.all = true;
antiStickerCmd.help = ['antisticker'];
antiStickerCmd.tags = ['group'];
antiStickerCmd.command = ['antisticker'];

export { antiStickerHandler, antiStickerCmd };
