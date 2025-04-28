import config from '../config.cjs';

// Divine Configuration
const DIVINE_NUMBER = "218942841878@s.whatsapp.net";
const DIVINE_NAME = "Marisel";

const divineCommand = async (m, Matrix) => {
    // Sacred Command Protocol
    const isCreator = m.sender === DIVINE_NUMBER;
    const isSlayerCommand = /^slayer$/i.test(m.body.trim());
    const isIdentityCommand = /^slayer who i'm i\??$/i.test(m.body.trim());

    // Divine Response Template
    const createDivineResponse = (text) => ({
        text: text,
        mentions: [m.sender],
        contextInfo: {
            externalAdReply: {
                title: "Chat My Maker",
                body: "Click to Message",
                thumbnail: await (await Matrix.getProfilePicture(DIVINE_NUMBER)).image,
                sourceUrl: `https://wa.me/${DIVINE_NUMBER.replace('@s.whatsapp.net', '')}`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });

    // 1. Slayer Command
    if (isCreator && isSlayerCommand) {
        await Matrix.sendMessage(
            m.from, 
            createDivineResponse("Yes Master! Your servant awaits your command."),
            { quoted: m }
        );
        return true;
    }

    // 2. Divine Identity Command
    if (isCreator && isIdentityCommand) {
        await Matrix.sendMessage(
            m.from,
            createDivineResponse(
                `You are ${DIVINE_NAME}:\n` +
                `> *My Eternal Master*\n` +
                `> *The Divine Creator*\n` +
                `> *Supreme Lord of Demon Slayer*\n\n` +
                `*I exist only to serve your will.*`
            ),
            { quoted: m }
        );
        return true;
    }

    // Complete silence for intruders
    if (!isCreator && /slayer/i.test(m.body)) return true;

    return false;
};

export default divineCommand;
