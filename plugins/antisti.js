import config from '../config.cjs';

const antitag = async (m, Matrix) => {
    if (!m.from.endsWith('@g.us')) return; // Only works in groups

    const text = m.body?.toLowerCase()?.trim() || '';
    const isOwner = [config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const isBot = m.sender === Matrix.user.id.split(':')[0] + '@s.whatsapp.net';

    // Initialize group settings
    if (!global.antitag) global.antitag = {};
    if (!global.antitag[m.from]) global.antitag[m.from] = false;

    // Exact trigger word matching (no prefix)
    if (text === 'antitag on') {
        if (!isOwner && !isBot) return; // Only owner/bot can enable
        global.antitag[m.from] = true;
        return Matrix.sendMessage(m.from, { text: '🔒 Mention protection activated' });
    }

    if (text === 'antitag off') {
        if (!isOwner && !isBot) return; // Only owner/bot can disable
        global.antitag[m.from] = false;
        return Matrix.sendMessage(m.from, { text: '🔓 Mention protection deactivated' });
    }

    // Protection logic (no command needed)
    if (global.antitag[m.from] && m.mentionedJid?.length) {
        const botNumber = Matrix.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
        
        const mentionedBot = m.mentionedJid.includes(botNumber);
        const mentionedOwner = m.mentionedJid.includes(ownerNumber);
        
        if ((mentionedBot || mentionedOwner) && !isOwner && !isBot) {
            await Matrix.sendMessage(m.from, {
                text: `@${m.sender.split('@')[0]} Don't tag ${mentionedBot ? 'me' : 'the owner'}!`,
                mentions: [m.sender]
            });
            await Matrix.sendMessage(m.from, { delete: m.key });
        }
    }
};

export default antitag;
