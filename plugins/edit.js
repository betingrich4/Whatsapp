import config from "../../config.cjs";

const editQueue = new Map();

const editMessage = async (m, Matrix) => {
    try {
        if (!m.quoted && !editQueue.has(m.sender)) {
            return m.reply("❌ Please reply to a message to edit it.");
        }

        if (m.body === '.edit') {
            const prompt = await m.reply(
                "✏️ *Reply with the new text for this message:*\n" +
                "(Your reply will be automatically deleted)"
            );
            editQueue.set(m.sender, {
                key: m.quoted.key,
                promptId: prompt.key.id
            });
        } else if (editQueue.has(m.sender)) {
            const { key, promptId } = editQueue.get(m.sender);
            
            await Matrix.sendMessage(m.from, {
                edit: key,
                text: m.body
            });
            
            // Cleanup
            await Matrix.sendMessage(m.from, { delete: promptId });
            await Matrix.sendMessage(m.from, { delete: m.key });
            editQueue.delete(m.sender);
            
            return; // Don't send additional reply
        }
    } catch (error) {
        console.error("Edit Error:", error);
        m.reply("❌ Failed to edit message");
    }
};

export default editMessage;
