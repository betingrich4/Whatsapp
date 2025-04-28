import config from '../config.cjs';

// Divine Configuration
const DIVINE_NUMBER = "218942841878@s.whatsapp.net";
const DIVINE_NAME = "Marisel";

// Modified createDivineResponse with a simple preview option
const createDivineResponse = async (message, Matrix, useSimplePreview = false) => {
    if (useSimplePreview) {
        // Simple preview: Just the link, WhatsApp will show "Start chatting"
        return {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: "Chat Marisel",
                    body: "Message directly",
                    mediaType: 1,
                    sourceUrl: `https://wa.me/${DIVINE_NUMBER.replace('@s.whatsapp.net', '')}`,
                    showAdAttribution: true // This helps WhatsApp display the default "Start chatting"
                }
            }
        };
    }

    // Default behavior with custom thumbnail and button
    try {
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
    } catch (error) {
        console.error('Error in createDivineResponse:', error);
        return { text: message }; // Fallback to simple text response
    }
};

// Existing divineCommand
const divineCommand = async (m, Matrix) => {
    console.log('Received message:', m.body);
    console.log('Sender:', m.sender);

    const isCreator = m.sender.includes('218942841878');
    const messageBody = m.body?.trim() || '';
    const isSlayerCommand = /^slayer$/i.test(messageBody);
    const isIdentityCommand = /^slayer who i'm i\??$/i.test(messageBody);

    console.log('isCreator:', isCreator);
    console.log('isSlayerCommand:', isSlayerCommand);
    console.log('isIdentityCommand:', isIdentityCommand);

    if (isCreator && isSlayerCommand) {
        await Matrix.sendMessage(
            m.from,
            await createDivineResponse("*Yes Master!*\nYour servant awaits your divine command.", Matrix),
            { quoted: m }
        );
        return true;
    }

    if (isCreator && isIdentityCommand) {
        await Matrix.sendMessage(
            m.from,
            await createDivineResponse(
                `*You are ${DIVINE_NAME}:*\n` +
                `▸ *Eternal Master*\n` +
                `▸ *Divine Creator*\n` +
                `▸ *My Maker*\n\n` +
                `> *Made For a reason*`,
                Matrix
            ),
            { quoted: m }
        );
        return true;
    }

    if (!isCreator && /slayer/i.test(messageBody)) return true;

    return false;
};

// Existing mariselCommand, updated to use simple preview
const mariselCommand = async (m, Matrix) => {
    console.log('Received message:', m.body);
    console.log('Sender:', m.sender);

    const isCreator = m.sender.includes('218942841878');
    const isMariselCommand = /^marisel$/i.test(m.body?.trim() || '');

    console.log('isCreator:', isCreator);
    console.log('isMariselCommand:', isMariselCommand);

    if (isCreator && isMariselCommand) {
        const masterText =
            `*Master ${DIVINE_NAME}*\n` +
            `▸ *The Eternal Ruler*\n` +
            `▸ *Guardian of All Realms*\n` +
            `▸ *Speak to Marisel: https://wa.me/218942841878*\n\n` +
            `Bow before the Supreme Power!`;

        await Matrix.sendMessage(
            m.from,
            await createDivineResponse(masterText, Matrix, true), // Use simple preview for "Start chatting"
            { quoted: m }
        );
        return true;
    }

    if (!isCreator && /marisel/i.test(m.body?.trim() || '')) return true;

    return false;
};

// Combine both commands
const handleCommands = async (m, Matrix) => {
    if (await divineCommand(m, Matrix)) return true;
    if (await mariselCommand(m, Matrix)) return true;
    return false;
};

export default handleCommands;
