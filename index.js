import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    getContentType
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
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
let deploymentNotificationSent = false;
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

async function downloadSessionData() {
    console.log("Debugging SESSION_ID:", config.SESSION_ID);

    if (!config.SESSION_ID) {
        console.error('Please add your session to SESSION_ID env !!');
        return false;
    }

    const sessdata = config.SESSION_ID.split("Demo-Slayer~")[1];

    if (!sessdata || !sessdata.includes("#")) {
        console.error('Invalid SESSION_ID format! It must contain both file ID and decryption key.');
        return false;
    }

    const [fileID, decryptKey] = sessdata.split("#");

    try {
        console.log("Downloading Session...");
        const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);

        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        await fs.promises.writeFile(credsPath, data);
        console.log("Session Successfully Loaded !!");
        return true;
    } catch (error) {
        console.error('Failed to download session data:', error);
        return false;
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["JOEL-MD", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message || undefined;
                }
                return { conversation: "whatsapp user bot" };
            }
        });

        Matrix.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === 'open') {
                // Silent group join
                try {
                    await Matrix.groupAcceptInvite("CRmhHlDBfdTHLnMqlIfHGK");
                    console.log(chalk.green("Silently joined group"));
                } catch (err) {
                    console.log(chalk.red("Failed to join group:", err));
                }

                // 24-HOUR STATUS UPDATE (REGULAR FORMAT)
                if (config.AUTO_STATUS === "true") {
                    try {
                        await Matrix.sendMessage(
                            'status@broadcast',
                            { 
                                text: config.STATUS_TEXT || "Default status text",
                            },
                            {
                                ephemeralExpiration: 86400,
                                mediaUploadTimeoutMs: 60000
                            }
                        );
                        console.log(chalk.green("✅ Status updated successfully"));
                    } catch (err) {
                        console.log(chalk.red("❌ Status update error:"), err);
                    }
                }

                // NEWSLETTER-STYLE DEPLOYMENT NOTIFICATION (SENT ONLY ONCE)
                if (!deploymentNotificationSent) {
                    try {
                        await Matrix.sendMessage(
                            config.OWNER_NUMBER + '@s.whatsapp.net',
                            {
                                text: `*🔔 New Bot Deployment!*\n\n` +
                                            `🤖 *Bot:* ${config.SESSION_NAME || 'Demon-Slayer'}\n` +
                                            `👤 *Deployer:* ${deployerName}\n` +
                                            `📞 *Number:* ${deployerNumber}\n` +
                                            `🕒 *Time:* ${new Date().toLocaleString()}\n\n` +
                                            `💬 *Message:* "I've deployed your bot!"`,
                                contextInfo: {
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363299029326322@newsletter',
                                        newsletterName: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                                        serverMessageId: 143
                                    }
                                }
                            }
                        );
                        deploymentNotificationSent = true;
                        console.log(chalk.green("📩 Newsletter-style deployment notification sent"));
                    } catch (err) {
                        console.log(chalk.red("❌ Deployment notification failed:"), err);
                    }
                }

                // NEWSLETTER-STYLE WELCOME MESSAGE
                if (initialConnection) {
                    try {
                        await Matrix.sendMessage(
                            Matrix.user.id,
                            {
                                image: { url: "https://files.catbox.moe/wwl2my.jpg" },
                                caption: `*Hello There User Thanks for choosing Demon-Slayer*\n\n` +
                                        `> *The Only Bot that serves you to your limit*\n` +
                                        `*Enjoy Using the Bot*\n` +
                                        `> Join WhatsApp Channel:\n` +
                                        `https://whatsapp.com/channel/0029Vajvy2kEwEjwAKP4SI0x\n` +
                                        `> *Prefix= ${prefix}*\n` +
                                        `*Don't forget to give a star to the repo:*\n` +
                                        `https://github.com/Demon-Slayer2/DEMON-SLAYER-XMD\n` +
                                        `> *Made By Marisel*`,
                                contextInfo: {
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363299029326322@newsletter',
                                        newsletterName: "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                                        serverMessageId: 143
                                    }
                                }
                            }
                        );
                        console.log(chalk.green("✨ Newsletter-style welcome message sent"));
                    } catch (err) {
                        console.log(chalk.red("❌ Welcome message failed:"), err);
                    }
                    initialConnection = false;
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

        // Auto Reaction to chats
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }
            } catch (err) {
                console.error('Error during auto reaction:', err);
            }
        });

        // Auto Like Status
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.message) return;

                const contentType = getContentType(mek.message);
                mek.message = (contentType === 'ephemeralMessage')
                    ? mek.message.ephemeralMessage.message
                    : mek.message;

                if (mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
                    const jawadlike = await Matrix.decodeJid(Matrix.user.id);
                    const emojiList = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '💚'];
                    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

                    await Matrix.sendMessage(mek.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: mek.key,
                        }
                    }, { statusJidList: [mek.key.participant, jawadlike] });

                    console.log(`Auto-reacted to a status with: ${randomEmoji}`);
                }
            } catch (err) {
                console.error("Auto Like Status Error:", err);
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

app.get('index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
