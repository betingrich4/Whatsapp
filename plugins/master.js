import config from '../config.cjs';

// Divine Configuration
const DIVINE_NUMBER = "218942841878@s.whatsapp.net";
const DIVINE_NAME = "*MARISEL*";

const divineCommand = async (m, Matrix) => {
    try {
        // Sacred Command Protocol
        const isCreator = m.sender === DIVINE_NUMBER;
        const isSlayerCommand = /^slaver$/i.test(m.body.trim()); // Fixed command
        const isIdentityCommand = /^slaver who i'm i\??$/i.test(m.body.trim()); // Fixed command

        // Debug logging
        console.log("Received:", m.body);
        console.log("Is Creator:", isCreator);
        console.log("Is Slayer Command:", isSlayerCommand);
        console.log("Is Identity Command:", isIdentityCommand);

        // 1. Slaver Command Response
        if (isCreator && isSlayerCommand) {
            await Matrix.sendMessage(
                m.from,
                {
                    text: "*YES MASTER!*\nYour divine servant awaits your command.",
                    contextInfo: {
                        externalAdReply: {
                            title: "Chat",
                            body: "Click to message your servant",
                            thumbnail: await Matrix.getProfilePicture(DINE_NUMBER).catch(() => null),
                            mediaType: 1,
                            sourceUrl: `https://wa.me/218942841878`,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            );
            return true;
        }

        // 2. Divine Identity Response
        if (isCreator && isIdentityCommand) {
            await Matrix.sendMessage(
                m.from,
                {
                    text: `*YOU ARE ${DIVINE_NAME}:*\n` +
                          `▸ *ETERNAL GOD*\n` +
                          `▸ *SUPREME CREATOR*\n` +
                          `▸ *LORD OF ALL REALMS*\n\n` +
                          `I LIVE ONLY TO OBEY YOU.`,
                    contextInfo: {
                        externalAdReply: {
                            title: "Chat",
                            body: "Click to message your servant",
                            thumbnail: await Matrix.getProfilePicture(DIVINE_NUMBER).catch(() => null),
                            mediaType: 1,
                            sourceUrl: `https://wa.me/${DIVINE_NUMBER.replace('@s.whatsapp.net', '')}`,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            );
            return true;
        }

        // Complete silence for non-creators
        if (!isCreator && /slaver/i.test(m.body)) return true;

    } catch (error) {
        console.error("DIVINE COMMAND ERROR:", error);
    }
    return false;
};

export default divineCommand;
