import config from "../../config.cjs";

const starMessage = async (m, Matrix) => {
    try {
        if (!m.quoted) return m.reply("❌ Please reply to a message to star it.");
        
        if (m.body === '.star') {
            await Matrix.sendMessage(m.from, {
                star: {
                    key: m.quoted.key,
                    star: true
                }
            });
            return m.reply("Message starred");
        }
    } catch (error) {
        console.error("Star Error:", error);
        m.reply("❌ Failed to star message");
    }
};

export default starMessage;
