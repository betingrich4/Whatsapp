import config from '../../config.cjs';

// Enhanced storage using Maps
const enabledGroups = new Map(); // Map<groupId, {warnLimit: number, gracePeriod: number}>
const warningStore = new Map(); // Map<groupId, Map<userId, {count: number, lastWarning: Date}>>

const antivoice = async (m, gss) => {
    try {
        const groupId = m.from;
        const senderId = m.sender;
        const body = m.body?.toLowerCase().trim();

        // Command handler (trigger words)
        if (body && m.isGroup) {
            // Enable/disable commands
            if (body === 'enable antivoice' || body === 'disable antivoice') {
                const groupMetadata = await gss.groupMetadata(groupId);
                const senderAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;

                if (!senderAdmin) {
                    return m.reply("*🚫 Only group admins can manage AntiVoice*");
                }

                if (body === 'enable antivoice') {
                    enabledGroups.set(groupId, { warnLimit: 3, gracePeriod: 0 });
                    return m.reply(
                        "*✅ AntiVoice enabled*\n" +
                        "Non-admins cannot send voice notes\n" +
                        "Use 'set antivoice 3 5' to customize warnings/grace period"
                    );
                } else {
                    enabledGroups.delete(groupId);
                    warningStore.delete(groupId);
                    return m.reply("*❌ AntiVoice disabled*");
                }
            }

            // Configuration commands
            if (body.startsWith('set antivoice')) {
                const args = body.split(' ').slice(2);
                const warnLimit = parseInt(args[0]) || 3;
                const gracePeriod = parseInt(args[1]) || 0;

                enabledGroups.set(groupId, { warnLimit, gracePeriod });
                return m.reply(
                    `*⚙️ AntiVoice Settings Updated*\n` +
                    `• Warnings before kick: ${warnLimit}\n` +
                    `• Grace period: ${gracePeriod} minutes`
                );
            }

            // Status check
            if (body === 'antivoice status') {
                const settings = enabledGroups.get(groupId);
                if (!settings) return m.reply("*❌ AntiVoice is disabled*");
                
                return m.reply(
                    `*🛡️ AntiVoice Status*\n` +
                    `• Active: ✅\n` +
                    `• Warn Limit: ${settings.warnLimit}\n` +
                    `• Grace Period: ${settings.gracePeriod} min`
                );
            }
        }

        // Voice message handling
        if (!m.isGroup || m.type !== 'audioMessage' || !enabledGroups.has(groupId)) return;

        const botNumber = await gss.decodeJid(gss.user.id);
        const groupMetadata = await gss.groupMetadata(groupId);
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
        const senderIsAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;

        if (!isBotAdmin || senderIsAdmin) return;

        // Delete voice note
        await gss.sendMessage(groupId, {
            delete: {
                remoteJid: groupId,
                fromMe: false,
                id: m.key.id,
                participant: senderId
            }
        }).catch(console.error);

        // Initialize warning storage
        if (!warningStore.has(groupId)) {
            warningStore.set(groupId, new Map());
        }
        const groupWarnings = warningStore.get(groupId);
        const userWarnings = groupWarnings.get(senderId) || { count: 0, lastWarning: null };

        // Check grace period
        const settings = enabledGroups.get(groupId);
        const now = new Date();
        if (userWarnings.lastWarning && 
            (now - userWarnings.lastWarning) < settings.gracePeriod * 60 * 1000) {
            return; // Within grace period
        }

        // Update warnings
        userWarnings.count += 1;
        userWarnings.lastWarning = now;
        groupWarnings.set(senderId, userWarnings);

        if (userWarnings.count < settings.warnLimit) {
            await gss.sendMessage(groupId, {
                text: `*⚠️ Warning ${userWarnings.count}/${settings.warnLimit}*\n` +
                      `@${senderId.split('@')[0]}, voice messages are not allowed here.`,
                mentions: [senderId]
            });
        } else {
            // Kick user after exceeding warnings
            await gss.sendMessage(groupId, {
                text: `*❌ Removed*\n@${senderId.split('@')[0]} exceeded ${settings.warnLimit} voice warnings.`,
                mentions: [senderId]
            });

            try {
                await gss.groupParticipantsUpdate(groupId, [senderId], 'remove');
            } catch (err) {
                await gss.sendMessage(groupId, {
                    text: `*⚠️ Couldn't remove @${senderId.split('@')[0]}*\nPlease check bot's admin permissions.`,
                    mentions: [senderId]
                });
            }

            // Reset warnings after kick
            groupWarnings.delete(senderId);
        }

    } catch (err) {
        console.error("AntiVoice Error:", err);
        // Send error to group if possible
        if (m.isGroup) {
            await gss.sendMessage(m.from, {
                text: "⚠️ An error occurred in AntiVoice. Please try again later."
            }).catch(() => {});
        }
    }
};

export default antivoice;
