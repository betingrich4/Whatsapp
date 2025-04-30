import config from '../config.js';
import { Boom } from '@hapi/boom';

// List of restricted commands in PM
const PM_BLOCKED_COMMANDS = [
    'menu', '.menu', 'ping', '.ping', 
    'alive', '.alive', 'play', '.play',
    'song', '.song', 'owner', '.owner'
];

// User warning tracker
const pmViolators = new Map();

const antiPMHandler = async (m, sock, next) => {
    try {
        // Check if message is in PM (not group)
        if (m.key.remoteJid.endsWith('@s.whatsapp.net')) {
            const command = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
            const cmdPrefix = command.match(/^[\\/!#.]/)?.[0] || '';
            const baseCmd = command.slice(cmdPrefix.length).split(' ')[0].toLowerCase();
            
            // Check if command is in blocked list
            if (PM_BLOCKED_COMMANDS.includes(baseCmd)) {
                const userId = m.key.participant || m.key.remoteJid;
                const violationCount = pmViolators.get(userId) || 0;
                
                // Increment violation count
                pmViolators.set(userId, violationCount + 1);
                
                // Progressive actions
                if (violationCount === 0) {
                    // Silent treatment for first violation
                    console.log(`PM Violation: ${userId} used ${baseCmd}`);
                    return;
                } 
                else if (violationCount === 1) {
                    // Warning for second violation
                    await sock.sendMessage(m.key.remoteJid, {
                        text: `⚠️ *Warning*: Bot commands are not allowed in PM.\nNext violation will result in being blocked.`,
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 999,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: config.CHANNEL_JID,
                                newsletterName: config.CHANNEL_NAME,
                                serverMessageId: 143
                            }
                        }
                    });
                    return;
                }
                else {
                    // Block user after third violation
                    await sock.updateBlockStatus(userId, 'block');
                    console.log(`Blocked ${userId} for PM violations`);
                    pmViolators.delete(userId);
                    throw new Boom('User blocked', { statusCode: 403 });
                }
            }
        }
        next(); // Continue processing if not blocked
    } catch (error) {
        console.error('AntiPM Error:', error);
    }
};

// Apply the middleware in your connection handler
// Add this before your command handler:
// sock.ev.on('messages.upsert', async (m) => {
//     await antiPMHandler(m, sock, async () => {
//         // Your existing command handling logic
//     });
// });

export default antiPMHandler;
