import config from "../../config.cjs";

const forwardQueue = new Map();

const forwardMessage = async (m, Matrix) => {
    try {
        if (!m.quoted && !forwardQueue.has(m.sender)) {
            return m.reply("❌ Please reply to a message to forward it.");
        }

        if (m.body === '.forward') {
            const prompt = await m.reply(
                "➡️ *Reply with the phone number to forward to:*\n" +
                "(Include country code, e.g., 1234567890)\n" +
                "(Your reply will be automatically deleted)"
            );
            forwardQueue.set(m.sender, {
                key: m.quoted.key,
                promptId: prompt.key.id
            });
        } else if (forwardQueue.has(m.sender)) {
            const { key, promptId } = forwardQueue.get(m.sender);
            const number = m.body.trim().replace(/[^0-9]/g, '');
            
            if (!number) {
                forwardQueue.delete(m.sender);
                return m.reply("❌ Invalid number format");
            }

            await Matrix.sendMessage(`${number}@s.whatsapp.net`, {
                forward: key
            });
            
            // Cleanup
            await Matrix.sendMessage(m.from, { delete: promptId });
            await Matrix.sendMessage(m.from, { delete: m.key });
            forwardQueue.delete(m.sender);
            
            return; // Don't send additional reply
        }
    } catch (error) {
        console.error("Forward Error:", error);
        m.reply("❌ Failed to forward message");
    }
};

export default forwardMessage;
