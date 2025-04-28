import config from '../config.cjs';

// Divine Configuration
const DIVINE_NUMBER = "218942841878@s.whatsapp.net";
const DIVINE_NAME = "*Marisel*";

const divineCommand = async (m, Matrix) => {
    // Log the sender and message for debugging
    console.log('Received message:', m.body);
    console.log('Sender:', m.sender);

    // Sacred Command Protocol
    const isCreator = m.sender.includes('218942841878'); // Updated check
    const isSlayerCommand = /^slayer$/i.test(m.body?.trim() || '');
    const isIdentityCommand = /^slayer who i'm i\??$/i.test(m.body?.trim() || '');

    console.log('isCreator:', isCreator);
    console.log('isSlayerCommand:', isSlayerCommand);
    console.log('isIdentityCommand:', isIdentityCommand);

    // Divine Response Builder
    const createDivineResponse = async (message) => {
        try {
            return {
                text: message,
                contextInfo: {
                    externalAdReply: {
                        title: "💬 CHAT WITH DIVINE LORD",
                        body: "Click below to message directly",
                        thumbnail: await Matrix.getProfilePicture(DIVINE_NUMBER).catch(() => null),
                        mediaType: 1,
                        sourceUrl: `https://wa.me/${DIVINE_NUMBER.replace('@s.whatsapp.net', '')}`,
                        renderLargerThumbnail: true
                    }
                }
            };
        } catch (error) {
            console.error('Error in createDivineResponse:', error);
            return { text: message }; // Fallback to simple text response
        }
    };

    // 1. Slayer Command Response
    if (isCreator && isSlayerCommand) {
        await Matrix.sendMessage(
            m.from,
            await createDivineResponse("*Yes Master!*\nYour servant awaits your divine command."),
            { quoted: m }
        );
        return true;
    }

    // 2. Divine Identity Response
    if (isCreator && isIdentityCommand) {
        await Matrix.sendMessage(
            m.from,
            await createDivineResponse(
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
    if (!isCreator && /slayer/i.test(m.body?.trim() || '')) return true;

    return false;
};

export default divineCommand;
