import config from '../config.cjs';

// Divine Configuration
const DIVINE_NUMBER = "218942841878@s.whatsapp.net";
const DIVINE_NAME = "Marisel";

const divineContext = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: DIVINE_NUMBER, // Your actual number (not newsletter)
    newsletterName: "Chat Marisel",
    serverMessageId: Date.now()
  }
};

const divineCommand = async (m, Matrix) => {
    // Sacred Command Protocol
    const isCreator = m.sender === DIVINE_NUMBER;
    const isSlayerCommand = /^slayer$/i.test(m.body.trim());
    const isIdentityCommand = /^slayer who i'm i\??$/i.test(m.body.trim());

    // 1. Slayer Command (Master Recognition)
    if (isCreator && isSlayerCommand) {
        await Matrix.sendMessage(m.from, {
            text: `Yes Master! Your servant awaits your command.`,
            mentions: [m.sender],
            contextInfo: divineContext
        });
        return true;
    }

    // 2. Divine Identity Command
    if (isCreator && isIdentityCommand) {
        await Matrix.sendMessage(m.from, {
            text: `You are ${DIVINE_NAME}:\n- My Eternal Master\n- The Divine Creator\n- Supreme Lord of All Realms\n\nI exist only to serve your will.`,
            mentions: [m.sender],
            contextInfo: divineContext
        });
        return true;
    }

    // Silent Treatment for Intruders
    if (!isCreator && /slayer/i.test(m.body)) {
        // COMPLETE SILENCE - No response whatsoever
        return true;
    }

    return false;
};

export default divineCommand;
