const fs = require('fs').promises;
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'profile2',
    desc: 'Get detailed user profile with groups and last seen',
    alias: ['scan2', 'whois2'],
    category: 'info',
    usage: '[reply-to-user]',
    async exec(client, m, { args, prefix }) {
        try {
            // Newsletter context
            const newsletterContext = {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363299029326322@newsletter',
                    newsletterName: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                    serverMessageId: 143
                }
            };

            const targetJid = m.quoted ? m.quoted.sender : m.sender;
            const displayName = m.quoted ? 
                `@${targetJid.split('@')[0]}` : 
                m.pushName || 'Unknown User';

            // Fetch all data in parallel
            const [
                profilePic,
                status,
                groups,
                lastSeen,
                isBusiness
            ] = await Promise.all([
                client.profilePictureUrl(targetJid, 'image').catch(() => null),
                client.fetchStatus(targetJid).catch(() => ({ status: "🛡️ Hidden" })),
                this.getUserGroups(client, targetJid),
                this.getLastSeen(client, targetJid),
                client.getBusinessProfile(targetJid).catch(() => null)
            ]);

            // Build profile message
            let profileMsg = `*🗡️ Demon-Slayer Profile Scan 2.0*\n\n` +
                           `• *Name:* ${displayName}\n` +
                           `• *JID:* ${targetJid}\n` +
                           `• *Business:* ${isBusiness ? '✅ Verified' : '❌ No'}\n` +
                           `• *Status:* ${status.status || "None"}\n` +
                           `• *Last Seen:* ${lastSeen}\n\n` +
                           `*🌑 Group Participation (${groups.count}):*\n${groups.list}\n\n` +
                           `_Scanned by @${m.sender.split('@')[0]}_`;

            // Send profile with or without image
            if (profilePic) {
                await client.sendMessage(m.chat, {
                    image: { url: profilePic },
                    caption: profileMsg,
                    mentions: [targetJid, m.sender],
                    contextInfo: newsletterContext
                }, { quoted: m });
            } else {
                await client.sendMessage(m.chat, {
                    text: profileMsg,
                    mentions: [targetJid, m.sender],
                    contextInfo: newsletterContext
                }, { quoted: m });
            }

            // Log scan to owner
            await this.logScan(client, m, targetJid, newsletterContext);

        } catch (err) {
            console.error('Profile2 error:', err);
            await client.sendMessage(m.chat, {
                text: '❌ Profile scan failed. The target may have strict privacy settings.',
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363299029326322@newsletter',
                        newsletterName: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
        }
    },

    async getUserGroups(client, jid) {
        try {
            const groupData = await client.groupFetchAllParticipating();
            const userGroups = Object.values(groupData)
                .filter(g => g.participants.some(p => p.id === jid))
                .map(g => `➼ ${g.subject} (${g.id.replace('@g.us', '')})`)
                .slice(0, 15); // Limit to 15 groups
            
            return {
                count: userGroups.length,
                list: userGroups.join('\n') || 'No mutual groups found',
                raw: userGroups
            };
        } catch {
            return { count: 0, list: 'Group data unavailable', raw: [] };
        }
    },

    async getLastSeen(client, jid) {
        try {
            const status = await client.fetchStatus(jid);
            if (!status.lastSeen) return '🕒 Online now';
            
            const lastSeenDate = new Date(status.lastSeen);
            const diff = Date.now() - status.lastSeen;
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) return '🕒 Just now';
            if (minutes < 60) return `🕒 ${minutes} min ago`;
            if (minutes < 1440) return `🕒 ${Math.floor(minutes/60)} hours ago`;
            
            return `📅 ${lastSeenDate.toLocaleDateString()}`;
        } catch {
            return '🛡️ Last seen hidden';
        }
    },

    async logScan(client, m, targetJid, newsletterContext) {
        try {
            const config = require('../config.cjs');
            if (targetJid === config.OWNER_NUMBER + '@s.whatsapp.net') return;
            
            await client.sendMessage(
                config.OWNER_NUMBER + '@s.whatsapp.net',
                {
                    text: `*🔭 Profile Scan Alert*\n\n` +
                          `• *Target:* ${targetJid}\n` +
                          `• *Scanned By:* @${m.sender.split('@')[0]}\n` +
                          `• *In Chat:* ${m.chat}\n` +
                          `• *At:* ${new Date().toLocaleString()}`,
                    mentions: [m.sender],
                    contextInfo: newsletterContext
                }
            );
        } catch (err) {
            console.error('Scan log error:', err);
        }
    }
};
