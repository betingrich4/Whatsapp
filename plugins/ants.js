import config from '../config.cjs';

const antistickerCommand = async (m, Matrix) => {
    const text = m.body.trim().toLowerCase();
    const isGroup = m.from.endsWith('@g.us');
    const isAdmin = m.isGroup && m.isAdmin;
    const isOwner = [config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    
    // Initialize per-group setting if not already
    if (!global.antisticker) global.antisticker = {};
    if (!global.antisticker[m.from]) global.antisticker[m.from] = false;

    if (!isGroup) return;

    // Handle toggles
    if (text === 'antisticker on') {
        if (!isAdmin && !isOwner) {
            await Matrix.sendMessage(m.from, { text: '*OWNER or ADMIN COMMAND ONLY*' }, { quoted: m });
            return;
        }

        global.antisticker[m.from] = true;
        await Matrix.sendMessage(m.from, { text: '*Antisticker is now enabled in this group.*' }, { quoted: m });
    }

    if (text === 'antisticker off') {
        if (!isAdmin && !isOwner) {
            await Matrix.sendMessage(m.from, { text: '*OWNER or ADMIN COMMAND ONLY*' }, { quoted: m });
            return;
        }

        global.antisticker[m.from] = false;
        await Matrix.sendMessage(m.from, { text: '*Antisticker is now disabled in this group.*' }, { quoted: m });
    }

    // Auto-delete stickers if feature is on
    if (global.antisticker[m.from] && m.type === 'stickerMessage') {
        await Matrix.sendMessage(m.from, { text: '*Stickers are not allowed in this group.*' }, { quoted: m });
        await Matrix.sendMessage(m.from, { delete: m.key });
    }
};

export default antistickerCommand;
