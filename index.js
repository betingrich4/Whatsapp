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
import { File } from 'megajs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;
const prefix = process.env.PREFIX || config.PREFIX;
const sessionName = "session";
const app = express();
const orange = chalk.gold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.MORT || 3000;

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

// Track bot start time for uptime calculation
const BOT_START_TIME = moment();

// Function to get current time in Nairobi in the desired format
function getCurrentTimeInNairobi() {
    return moment().tz('Africa/Nairobi').format('HH:mm:ss dddd');
}

// Function to get bot uptime in the desired format
function getBotUptime() {
    const uptime = moment.duration(moment().diff(BOT_START_TIME));
    const hours = uptime.hours();
    const minutes = uptime.minutes();
    return `${hours}Hrs ${minutes}Min`;
}

// Function to update WhatsApp bio
async function updateWhatsAppBio(Matrix) {
    try {
        const currentTime = getCurrentTimeInNairobi();
        const uptime = getBotUptime();
        const newBio = `𓆂 ${currentTime} |𓆀 ${uptime}`;

        await Matrix.updateProfileStatus(newBio);
        console.log(chalk.green(`Updated WhatsApp bio: ${newBio}`));
    } catch (error) {
        console.error(chalk.red('Failed to update WhatsApp bio:', error));
    }
}

// ANTILINK and ANTIBOT logic
const linkWarnings = new Map(); // Track warnings for users sending links
const userWarnings = new Map(); // Track warnings for users using other bots

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Demon-Slayer using WA v${version.join('.')}, isLatest: ${isLatest}`);

        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["Demon", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message || undefined;
                }
                return { conversation: "whatsapp user bot" };
            }
        });

        Matrix.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("Connected Successfully"));
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

                    // Start periodic bio update
                    setInterval(() => updateWhatsAppBio(Matrix), 60000); // Update every 60 seconds
                } else {
                    console.log(chalk.blue("♻️ Connection reestablished after restart."));
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
                console.log(mek);
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    console.log(mek);
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }

                // ANTILINK: Detect and delete links
                if (config.ANTILINK && mek.key.remoteJid.endsWith('@g.us')) {
                    const linkRegex = /https?:\/\/[^\s]+/i;
                    const containsLink = linkRegex.test(mek.message?.conversation || mek.message?.extendedTextMessage?.text || '');

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

                // ANTIBOT: Detect and remove other bots
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
                console.error('Error during auto reaction:', err);
            }
        });

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                const fromJid = mek.key.participant || mek.key.remoteJid;
                if (!mek || !mek.message) return;
                if (mek.key.fromMe) return;
                if (mek.message?.protocolMessage || mek.message?.ephemeralMessage || mek.message?.reactionMessage) return;
                if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
                    await Matrix.readMessages([mek.key]);

                    if (config.AUTO_STATUS_REPLY) {
                        const customMessage = config.STATUS_READ_MSG || 'Auto Status Seen.';
                        await Matrix.sendMessage(fromJid, { text: customMessage }, { quoted: mek });
                    }
                }
            } catch (err) {
                console.error('Error handling messages.upsert event:', err);
            }
        });

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
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
