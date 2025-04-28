import config from '../config.cjs';

// Divine Configuration
const DIVINE_NUMBER = "218942841878@s.whatsapp.net";
const DIVINE_NAME = "*Marisel*";

const divineCommand = async (m, Matrix) => {
    // Sacred Command Protocol
    const isCreator = m.sender === DIVINE_NUMBER;
    const isSlayerCommand = /^slayer$/i.test(m.body.trim());
    const isIdentityCommand = /^slayer who i'm i\??$/i.test(m.body.trim());

    // Divine Response Builder
    const createDivineResponse = (message) => {
        return {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: "Chat Marisel",
                    body: "Click below to message directly",
                    thumbnail: await Matrix.getProfilePicture(DIVINE_NUMBER).catch(() => null),
                    mediaType: 1,
                    sourceUrl: `https://wa.me/${DIVINE_NUMBER.replace('@s.whatsapp.net', '')}`,
                    renderLargerThumbnail: true
                }
            }
        };
    };

    // 1. Slayer Command Response
    if (isCreator && isSlayerCommand) {
        await Matrix.sendMessage(
            m.from,
            createDivineResponse("*Yes Master!*\n*Your servant awaits your divine command.*"),
            { quoted: m }
        );
        return true;
    }

    // 2. Divine Identity Response
    if (isCreator && isIdentityCommand) {
        await Matrix.sendMessage(
            m.from,
            createDivineResponse(
                `*You are ${DIVINE_NAME}:*\n` +
                `▸ *Eternal Master*\n` +
                `▸ *Divine Creator*\n` +
                `▸ *Supreme Lord*\n\n` +
                `I exist *only* to serve your will.`
            ),
            { quoted: m }
        );
        return true;
    }

    // Absolute silence for non-creators
    if (!isCreator && /slayer/i.test(m.body)) return true;

    return false;
};

export default divineCommand;
