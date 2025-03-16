import config from "../../config.cjs";

const antiLeft = async (sock, update) => {
    const { id, participants } = update;
    const antiLeftEnabled = config.ANTI_LEFT; // Ensure this setting exists in config.cjs

    if (!antiLeftEnabled) return;

    for (const participant of participants) {
        if (update.action === "remove") {
            try {
                await sock.groupParticipantsUpdate(id, [participant], "add");
                await sock.sendMessage(id, { text: `*Anti-Left Enabled!*\n*${participant.split("@")[0]} has been re-added to the group.*` });
            } catch (error) {
                console.error("Anti-Left Error:", error);
                await sock.sendMessage(id, { text: `*Failed to re-add ${participant.split("@")[0]}.*` });
            }
        }
    }
};

export default antiLeft;
