import config from '../../config.cjs';

const antiDelete = {
    enabledChats: new Set(), // Stores chats where anti-delete is enabled

    async handleMessageDelete(message, client) {
        if (!message.key || !message.key.remoteJid || !message.key.fromMe) return;

        const chatId = message.key.remoteJid;
        if (!this.enabledChats.has(chatId)) return; // Ignore if anti-delete is not enabled in the chat

        const sender = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderName = isGroup ? `@${sender.split('@')[0]}` : "The user";

        // Try to retrieve the deleted message
        let originalMessage = message.message || {};
        let restoredText = "";

        if (originalMessage.conversation) restoredText = originalMessage.conversation;
        else if (originalMessage.extendedTextMessage) restoredText = originalMessage.extendedTextMessage.text;
        else if (originalMessage.imageMessage) restoredText = "[Image]";
        else if (originalMessage.videoMessage) restoredText = "[Video]";
        else if (originalMessage.documentMessage) restoredText = "[Document]";
        else restoredText = "[Media Message]";

        const replyText = `*Anti-Delete Alert*\n\n${senderName} deleted a message!\n*Recovered Message:* ${restoredText}`;

        await client.sendMessage(chatId, { text: replyText }, { quoted: message });
    },

    async toggleAntiDelete(message, client) {
        const chatId = message.key.remoteJid;
        const command = message.body.toLowerCase();

        if (command === `${config.PREFIX}antidelete on`) {
            this.enabledChats.add(chatId);
            await message.reply("✅ *Anti-Delete is now ACTIVE!* Deleted messages will be restored.");
        } else if (command === `${config.PREFIX}antidelete off`) {
            this.enabledChats.delete(chatId);
            await message.reply("❌ *Anti-Delete is now DISABLED!* Deleted messages will not be recovered.");
        }
    }
};

export default antiDelete;
