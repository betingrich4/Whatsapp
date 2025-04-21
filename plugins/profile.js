module.exports = async (context) => {
    const { client, m } = context;
    const config = require('../config.cjs');

    // Newsletter context
    const newsletterContext = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: config.CHANNEL_JID || '120363299029326322@newsletter',
            newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
            serverMessageId: 143
        }
    };

    // Function to get relative last seen time
    const getLastSeen = async (jid) => {
        try {
            const status = await client.fetchStatus(jid);
            if (!status.lastSeen) return '🟢 Online now';
            
            const now = Date.now();
            const diff = now - status.lastSeen;
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) return '🕒 Just now';
            if (minutes < 60) return `🕒 ${minutes} min ago`;
            if (minutes < 1440) return `🕒 ${Math.floor(minutes/60)} hours ago`;
            
            return `📅 ${new Date(status.lastSeen).toLocaleDateString()}`;
        } catch {
            return '🔴 Last seen hidden';
        }
    };

    const targetJid = m.quoted ? m.quoted.sender : m.sender;
    const name = m.quoted ? `@${targetJid.split('@')[0]}` : m.pushName || 'Unknown';

    try {
        // Fetch all data in parallel for better performance
        const [ppUrl, status, lastSeen] = await Promise.all([
            client.profilePictureUrl(targetJid, 'image').catch(() => 
                "https://telegra.ph/file/95680cd03e012bb08b9e6.jpg"),
            client.fetchStatus(targetJid).catch(() => 
                ({ status: "🛡️ Status hidden by privacy" })),
            getLastSeen(targetJid)
        ]);

        const mess = {
            image: { url: ppUrl },
            caption: `*🗡️ Demon-Slayer Profile Scan*\n\n` +
                    `• *Name:* ${name}\n` +
                    `• *JID:* ${targetJid}\n` +
                    `• *Last Seen:* ${lastSeen}\n` +
                    `• *About:* ${status.status}\n\n` +
                    `_Scanned by @${m.sender.split('@')[0]}_`,
            mentions: [targetJid, m.sender],
            contextInfo: newsletterContext
        };

        await client.sendMessage(m.chat, mess, { quoted: m });

    } catch (error) {
        console.error('Profile error:', error);
        await client.sendMessage(m.chat, {
            text: '❌ Failed to scan profile. Privacy restrictions may apply.',
            contextInfo: newsletterContext
        }, { quoted: m });
    }
};
