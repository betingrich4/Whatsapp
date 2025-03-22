import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;

const sessionName = "session";
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Store warnings for each user
const userWarnings = new Map();
const linkWarnings = new Map(); // For antilink feature

async function downloadSessionData() {
    if (!config.SESSION_ID) {
        console.error('Please add your session to SESSION_ID env !!');
        return false;
    }
    const sessdata = config.SESSION_ID.split("Demon-Slayer~")[1];
    const url = `https://pastebin.com/raw/${sessdata}`;
    try {
        const response = await axios.get(url);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        await fs.promises.writeFile(credsPath, data);
        console.log("🔒 Session Successfully Loaded !!");
        return true;
    } catch (error) {
        return false;
    }
}

// Function to update the bot's bio
async function updateBio(Matrix) {
    try {
        const bioTemplate = `${config.BOT_NAME} | ${moment().tz("Africa/Nairobi").format("HH:mm:ss")}`;
        await Matrix.updateProfileStatus(bioTemplate);
        console.log(chalk.green(`✅ Bio updated: ${bioTemplate}`));
    } catch (error) {
        console.error(chalk.red('❌ Error updating bio:'), error);
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`demon-slayer using WA v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["demon", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message || undefined;
                }
                return { conversation: "demon-slayer whatsapp user bot" };
            }
        });

        Matrix.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("Demon slayer Connected"));
                    Matrix.sendMessage(Matrix.user.id, { 
                        image: { url: "https://files.catbox.moe/5kvvfg.jpg" }, 
                        caption: `╭─────────────━┈⊷
│ *ᴅᴇᴍᴏɴ sʟᴀʏᴇʀ*
╰─────────────━┈⊷

╭─────────────━┈⊷
│ *ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ*
│ *ᴘʟᴇᴀsᴇ ғᴏʟʟᴏᴡ ᴜs ʙᴇʟᴏᴡ*
╰─────────────━┈⊷

> *ᴍᴀᴅᴇ ʙʏ 3 ᴍᴇɴ ᴀʀᴍʏ*`
                    });
                    initialConnection = false;

                    // Update bio on initial connection
                    if (config.AUTO_BIO) {
                        await updateBio(Matrix);
                    }
                } else {
                    console.log(chalk.blue("Connection reestablished after restart."));
                }
            }
        });

        Matrix.ev.on('creds.update', saveCreds);

        Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];

                // Automatically react to messages if enabled
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await doReact(randomEmoji, mek, Matrix);
                }

                // **AUTO STATUS VIEW: Automatically view statuses**
                if (config.AUTO_STATUS_VIEW && mek.key.remoteJid.endsWith('@broadcast') && (mek.message?.imageMessage || mek.message?.videoMessage)) {
                    try {
                        await Matrix.readMessages([mek.key]);
                        console.log(chalk.green(`✅ Viewed status from ${mek.key.participant || mek.key.remoteJid}`));
                    } catch (error) {
                        console.error('❌ Error marking status as viewed:', error);
                    }
                }

                // **AUTO STATUS REACTION: Automatically react to statuses**
                if (config.AUTO_STATUS_REACTION && mek.key.remoteJid.endsWith('@broadcast') && (mek.message?.imageMessage || mek.message?.videoMessage)) {
                    try {
                        await Matrix.sendMessage(mek.key.remoteJid, { react: { text: '❤️,🐥', key: mek.key } });
                    } catch (error) {
                        console.error('*Error reacting to status:*', error);
                    }
                }

                // **ANTILINK: Detect and delete links**
                if (config.ANTILINK && m.isGroup) {
                    const linkRegex = /https?:\/\/[^\s]+/i;
                    const containsLink = linkRegex.test(mek.body);

                    if (containsLink) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const groupMetadata = await Matrix.groupMetadata(mek.key.remoteJid);
                        const isAdmin = groupMetadata.participants.find(participant => participant.id === sender)?.admin === 'admin';

                        // Skip if the sender is an admin
                        if (isAdmin) return;

                        // Delete the message containing the link
                        try {
                            await Matrix.sendMessage(mek.key.remoteJid, { delete: mek.key });
                        } catch (error) {
                            console.error('Failed to delete message:', error);
                        }

                        // Get the number of warnings for this user
                        const warnings = linkWarnings.get(sender) || 0;

                        if (warnings < 1) {
                            // Warn the user
                            linkWarnings.set(sender, warnings + 1);
                            await Matrix.sendMessage(mek.key.remoteJid, {
                                text: `⚠️ Warning ${warnings + 1}/1: Please do not send links in this group. Next violation will result in removal.`,
                                mentions: [sender],
                            }, { quoted: mek });
                        } else {
                            // Remove the user after 1 warning
                            try {
                                await Matrix.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                await Matrix.sendMessage(mek.key.remoteJid, {
                                    text: `🚫 @${sender.split('@')[0]} has been removed for sending links.`,
                                    mentions: [sender],
                                }, { quoted: mek });
                                linkWarnings.delete(sender); // Reset warnings after removal
                            } catch (error) {
                                console.error('Failed to remove user:', error);
                                await Matrix.sendMessage(mek.key.remoteJid, {
                                    text: `❌ Failed to remove @${sender.split('@')[0]}. Please check bot permissions.`,
                                    mentions: [sender],
                                }, { quoted: mek });
                            }
                        }
                    }
                }

                // **ANTIBOT: Detect and remove other bots**
                const isBotCommand = mek.message?.conversation?.startsWith(config.PREFIX) || mek.message?.extendedTextMessage?.text?.startsWith(config.PREFIX);
                if (isBotCommand && mek.key.fromMe === false && mek.key.remoteJid.endsWith('@g.us')) {
                    const sender = mek.key.participant || mek.key.remoteJid;
                    const groupMetadata = await Matrix.groupMetadata(mek.key.remoteJid);
                    const isAdmin = groupMetadata.participants.find(participant => participant.id === sender)?.admin === 'admin';

                    // Skip if the sender is an admin
                    if (isAdmin) return;

                    const warnings = userWarnings.get(sender) || 0;

                    if (warnings < 2) {
                        // Warn the user
                        userWarnings.set(sender, warnings + 1);
                        await Matrix.sendMessage(mek.key.remoteJid, {
                            text: `⚠️ Warning ${warnings + 1}/2: Please do not use other bots in this group. Next violation will result in removal.`,
                            mentions: [sender],
                        }, { quoted: mek });
                    } else {
                        // Remove the user after 2 warnings
                        try {
                            await Matrix.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                            await Matrix.sendMessage(mek.key.remoteJid, {
                                text: `🚫 @${sender.split('@')[0]} has been removed for using other bots.`,
                                mentions: [sender],
                            }, { quoted: mek });
                            userWarnings.delete(sender); // Reset warnings after removal
                        } catch (error) {
                            console.error('Failed to remove user:', error);
                            await Matrix.sendMessage(mek.key.remoteJid, {
                                text: `❌ Failed to remove @${sender.split('@')[0]}. Please check bot permissions.`,
                                mentions: [sender],
                            }, { quoted: mek });
                        }
                    }
                }
                
            } catch (err) {
                console.error('Error during auto reaction/status reaction:', err);
            }
        });

        // Update bio periodically if AUTO_BIO is enabled
        if (config.AUTO_BIO) {
            setInterval(async () => {
                await updateBio(Matrix);
            }, 60000); // Update bio every 60 seconds
        }

    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Session file found, proceeding without QR code.");
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            console.log("🔒 Session downloaded, starting bot.");
            await start();
        } else {
            console.log("No session found or downloaded, QR code will be printed for authentication.");
            useQR = true;
            await start();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.send('CONNECTED SUCCESSFULL');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
