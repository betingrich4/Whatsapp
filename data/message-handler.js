Matrix.ev.on("messages.upsert", async (chatUpdate) => {
    try {
        const mek = chatUpdate.messages[0];
        // ... existing code ...
        
        // Handle message commands
        if (text === '.pin' || ['1','2','3'].includes(text)) {
            await pinMessage({ body: text, quoted: mek, from: fromJid, sender }, Matrix);
        } else if (text === '.star') {
            await starMessage({ body: text, quoted: mek, from: fromJid, sender }, Matrix);
        } else if (text === '.edit' || editQueue.has(sender)) {
            await editMessage({ body: text, quoted: mek, from: fromJid, sender, key: mek.key }, Matrix);
        } else if (text === '.forward' || forwardQueue.has(sender)) {
            await forwardMessage({ body: text, quoted: mek, from: fromJid, sender, key: mek.key }, Matrix);
        }
        
        // ... rest of your existing code ...
    } catch (err) {
        console.error('Error handling message:', err);
    }
});
