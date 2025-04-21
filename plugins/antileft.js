import config from "../config.cjs";
import chalk from "chalk";
import { delay } from "@whiskeysockets/baileys";

const antiLeftDB = new Map();

const antiLeft = async (m, client) => {
    try {
        // Add null checks for message object
        if (!m || !m.body) return;
        
        const cmd = m.body.toLowerCase().trim();

        // Enable anti-left
        if (cmd === `${config.PREFIX}antileft on`) {
            if (!m.isGroup) {
                return client.sendMessage(m.from, { text: "*This command only works in groups!*" });
            }

            const groupMetadata = await client.groupMetadata(m.from);
            const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

            if (!isAdmin) {
                return client.sendMessage(m.from, { text: "*Only admins can enable anti-left!*" });
            }

            antiLeftDB.set(m.from, true);
            return client.sendMessage(m.from, { 
                text: "*🚫 Anti-left activated!*\nMembers who leave will be automatically re-added."
            });
        }

        // Disable anti-left
        if (cmd === `${config.PREFIX}antileft off`) {
            if (!m.isGroup) {
                return client.sendMessage(m.from, { text: "*This command only works in groups!*" });
            }

            const groupMetadata = await client.groupMetadata(m.from);
            const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

            if (!isAdmin) {
                return client.sendMessage(m.from, { text: "*Only admins can disable anti-left!*" });
            }

            antiLeftDB.delete(m.from);
            return client.sendMessage(m.from, { 
                text: "*Anti-left deactivated!*\nMembers can now leave freely."
            });
        }
    } catch (error) {
        console.error(chalk.red("Anti-left command error:"), error);
        // Don't throw error to prevent crashing the bot
    }
};

const handleAntiLeft = async (client, message) => {
    try {
        const { id, participant, action } = message;
        
        // Skip if not a leave/remove action
        if (action !== 'remove' && action !== 'leave') return;
        
        // Check if anti-left is enabled
        const shouldAct = config.ANTI_GROUP_LEAVE === "true" || antiLeftDB.get(id);
        if (!shouldAct) return;

        const groupMetadata = await client.groupMetadata(id);
        const isBotAdmin = groupMetadata.participants.find(p => p.id === client.user.id)?.admin;
        
        if (!isBotAdmin) {
            console.log(chalk.yellow("⚠️ Bot is not admin, cannot re-add members"));
            return;
        }

        await delay(3000); // Wait 3 seconds before re-adding
        
        try {
            console.log(chalk.blue(`Attempting to re-add ${participant}`));
            await client.groupParticipantsUpdate(id, [participant], 'add');
            
            await client.sendMessage(id, {
                text: `🚫 @${participant.split('@')[0]} *Tried to leave but was brought back!*\n` +
                      `_Anti-leave protection is active in this group!_`,
                mentions: [participant]
            });
        } catch (addError) {
            console.error(chalk.red("Re-add failed:"), addError);
            
            const admins = groupMetadata.participants
                .filter(p => p.admin && p.id !== client.user.id)
                .map(p => p.id);
            
            if (admins.length > 0) {
                await client.sendMessage(id, {
                    text: `⚠️ Failed to re-add @${participant.split('@')[0]}!\n` +
                          `Possible reasons:\n` +
                          `• User blocked the bot\n` +
                          `• Bot lost admin rights\n` +
                          `• User left too quickly`,
                    mentions: admins
                });
            }
        }
    } catch (error) {
        console.error(chalk.red('❌ Anti-left handler error:'), error);
    }
};

export { antiLeft, handleAntiLeft };
