import config from '../config.cjs';

const MASTER_NUMBER = "218942841878@s.whatsapp.net";

const masterCommand = async (m, Matrix) => {
    // Check if the message is from the master number
    const isMaster = m.sender === MASTER_NUMBER;
    
    // Check if the message contains the activation phrase (case insensitive)
    const isActivationPhrase = m.body && m.body.toLowerCase().includes("demon");

    if (isMaster && isActivationPhrase) {
        try {
            // Respond to master
            await Matrix.sendMessage(m.from, { 
                text: `Yes my master! How may I serve you today?`,
                mentions: [m.sender]
            }, { quoted: m });

            // You can add additional master-only privileges here
            config.BOT_MASTER = m.sender;
            console.log(`Master recognized: ${m.sender}`);

        } catch (error) {
            console.error("Error in master command:", error);
        }
        return true; // Stop further processing
    }

    // Optional: Reject if others try to use the command
    if (!isMaster && isActivationPhrase) {
        await Matrix.sendMessage(m.from, {
            text: "You are not worthy to command me!",
            mentions: [m.sender]
        }, { quoted: m });
        return true; // Stop further processing
    }

    return false; // Continue with other commands
};

export default masterCommand;
