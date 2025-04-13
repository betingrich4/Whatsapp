import config from "../config.cjs";
import chalk from "chalk";
import { delay } from "@whiskeysockets/baileys";

const antiLeftDB = new Map();

const antiLeft = async (m, client) => {
    try {
        const cmd = m.body.toLowerCase().trim();

        // Enable anti-left
        if (cmd === `${config.PREFIX}antileft on`) {
            if (!m.isGroup) return client.sendMessage(m.from, { text: "*This command only works in groups!*" });

            const groupMetadata = await client.groupMetadata(m.from);
            const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

            if (!isAdmin) return client.sendMessage(m.from, { text: "*Only admins can enable anti-left!*" });

            antiLeftDB.set(m.from, true);
            return client.sendMessage(m.from, { 
                text: "*🚫 Anti-left activated!*\nMembers who leave will be automatically re-added."
            });
        }

        // Disable anti-left
        if (cmd === `${config.PREFIX}antileft off`) {
            if (!m.isGroup) return client.sendMessage(m.from, { text: "*This command only works in groups!*" });

            const groupMetadata = await client.groupMetadata(m.from);
            const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

            if (!isAdmin) return client.sendMessage(m.from, { text: "*Only admins can disable anti-left!*" });

            antiLeftDB.delete(m.from);
            return client.sendMessage(m.from, { 
                text: "*✅ Anti-left deactivated!*\nMembers can now leave freely."
            });
        }
    } catch (error) {
        console.error(chalk.red("Anti-left command error:"), error);
    }
};

const handleAntiLeft = async (client, message) => {
    try {
        const { id, participant, action } = message;
        
        // Check if anti-left is enabled for this group
        const isGloballyEnabled = config.ANTI_GROUP_LEAVE === "true";
        const isGroupEnabled = antiLeftDB.get(id);
        
        if (!isGloballyEnabled && !isGroupEnabled) return;
        
        if (action === 'remove' || action === 'leave') {
            const groupMetadata = await client.groupMetadata(id);
            const isBotAdmin = groupMetadata.participants.find(p => p.id === client.user.id)?.admin;
            
            if (isBotAdmin) {
                await delay(2000);
                
                try {
                    await client.groupParticipantsUpdate(id, [participant], 'add');
                    console.log(chalk.green(`Re-added ${participant} to group ${id}`));
                    
                    await client.sendMessage(id, { 
                        text: `@${participant.split('@')[0]} tried to leave but was brought back! 😈\n\n*Anti-left is active in this group!*`,
                        mentions: [participant]
                    });
                } catch (addError) {
                    console.error(chalk.red("Failed to re-add participant:"), addError);
                    
                    const admins = groupMetadata.participants
                        .filter(p => p.admin)
                        .map(p => p.id);
                    
                    await client.sendMessage(id, {
                        text: `Failed to re-add @${participant.split('@')[0]}!\n\n*Make sure I have admin rights and the user hasn't blocked me.*`,
                        mentions: admins
                    });
                }
            }
        }
    } catch (error) {
        console.error(chalk.red('Anti-left handler error:'), error);
    }
};

export { antiLeft, handleAntiLeft };
