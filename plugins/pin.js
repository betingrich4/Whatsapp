import config from "../../config.cjs";

const pinMessage = async (m, Matrix) => {
    try {
        if (!m.quoted) return m.reply("❌ Please reply to a message to pin it.");
        
        const pinDurations = {
            '1': { days: 7, label: "7 days" },
            '2': { days: 1, label: "24 hours" },
            '3': { days: 30, label: "1 month" }
        };

        if (m.body === '.pin') {
            return m.reply(
                `📌 *Pin Duration Options:*\n` +
                `1️⃣ = 7 days\n` +
                `2️⃣ = 24 hours\n` +
                `3️⃣ = 1 month\n\n` +
                `Reply with the number to choose`
            );
        }

        if (pinDurations[m.body]) {
            const duration = pinDurations[m.body];
            await Matrix.pinMessage(m.from, m.quoted.key, duration.days * 86400);
            return m.reply(`✅ Message pinned for ${duration.label}`);
        }
    } catch (error) {
        console.error("Pin Error:", error);
        m.reply("❌ Failed to pin message");
    }
};

export default pinMessage;
