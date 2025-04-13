import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    getContentType,
    delay
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

async function handleAntiGroupLeave(client, message) {
    try {
        const { id, participant, action } = message;
        if (action === 'remove' || action === 'leave') {
            const groupMetadata = await client.groupMetadata(id);
            const isBotAdmin = groupMetadata.participants.find(p => p.id === client.user.id)?.admin;
            
            if (isBotAdmin) {
                await delay(2000); // Wait 2 seconds before re-adding
                await client.groupParticipantsUpdate(id, [participant], 'add');
                console.log(chalk.green(`Re-added ${participant} to group ${id}`));
                
                // Optional: Send welcome back message
                await client.sendMessage(id, { 
                    text: `@${participant.split('@')[0]} tried to leave but we brought them back! 😈`,
                    mentions: [participant]
                });
            }
        }
    } catch (error) {
        console.error(chalk.red('Anti-group-leave error:'), error);
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

        const client = makeWASocket({
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
            },
            msgRetryCounterCache
        });

        client.ev.on('connection.update', async update => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === "open") {
                // Silent channel follow
                try {
                    const channelJid = "120363299029326322@newsletter";
                    await client.subscribeToChannel(channelJid);
                    console.log(chalk.green("✅ Channel followed silently"));
                } catch (err) {
                    console.log(chalk.red("❌ Failed to follow the channel:", err));
                }

                // Silent group join
                try {
                    const groupInviteCode = "CRmhHlDBfdTHLnMqlIfHGK";
                    await client.groupAcceptInvite(groupInviteCode);
                    console.log(chalk.green("✅ Group joined silently"));
                } catch (err) {
                    console.log(chalk.red("❌ Failed to join group:", err));
                }

                if (initialConnection) {
                    console.log(chalk.green("Connected Successfully"));
                    await client.sendMessage(client.user.id, {
                        image: { url: "https://files.catbox.moe/wwl2my.jpg" },
                        caption: `*Hello There User Thanks for choosing Demon-Slayer* 

> *The Only Bot that serves you to your limit*
*Enjoy Using the Bot* 
> Join WhatsApp Channel:
https://whatsapp.com/channel/0029Vajvy2kEwEjwAKP4SI0x
> *Prefix= ${prefix}*
*Don't forget to give a star to the repo:* 
https://github.com/Demon-Slayer2/DEMON-SLAYER-XMD
> *Made By Marisel*`
                    });
                    initialConnection = false;
                } else {
                    console.log(chalk.blue("♻️ Connection reestablished after restart."));
                }
            }
        });

        client.ev.on('creds.update', saveCreds);
        client.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, client, logger));
        client.ev.on("call", async (json) => await Callupdate(json, client));
        
        // Modified group participants update handler
        client.ev.on("group-participants.update", async (message) => {
            try {
                // First handle the original group update functionality
                await GroupUpdate(client, message);
                
                // Then handle anti-group-leave if enabled
                if (config.ANTI_GROUP_LEAVE === "true") {
                    await handleAntiGroupLeave(client, message);
                }
            } catch (error) {
                console.error(chalk.red('Group participants update error:'), error);
            }
        });

        if (config.MODE === "public") {
            client.public = true;
        } else if (config.MODE === "private") {
            client.public = false;
        }

        client.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, client);
                    }
                }
            } catch (err) {
                console.error('Error during auto reaction:', err);
            }
        });

        client.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.message) return;

                const contentType = getContentType(mek.message);
                mek.message = (contentType === 'ephemeralMessage')
                    ? mek.message.ephemeralMessage.message
                    : mek.message;

                if (mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
                    // Extended emoji list with 100+ options
                    const emojiList = [
                        '❤️', '😂', '😍', '🔥', '👍', '😊', '🎉', '🤔', '😎', '🙌',
                        '👏', '🤩', '🤯', '😢', '🤮', '💩', '👀', '🙄', '😴', '🥳',
                        '🥺', '🤬', '🤪', '😇', '🤠', '😈', '👻', '🤖', '👽', '👾',
                        '💯', '✨', '🌟', '💫', '💥', '💦', '💨', '🕳️', '🎯', '🧨',
                        '⚡', '🌈', '🌊', '🍕', '🍔', '🍟', '🍦', '🍭', '🎂', '🍻',
                        '🏆', '🎮', '🎲', '🎸', '🎹', '🎨', '🎭', '💃', '🕺', '👯',
                        '🚀', '🛸', '🎇', '🎆', '🌠', '🌌', '🌙', '⭐', '☀️', '🌞',
                        '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒',
                        '🌓', '🌔', '🌍', '🌎', '🌏', '🌐', '🗺️', '🧭', '⏳', '⌛',
                        '🕰️', '⏰', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞'
                    ];
                    
                    // Get 1-3 random emojis
                    const randomCount = Math.floor(Math.random() * 3) + 1;
                    const randomEmojis = [];
                    
                    for (let i = 0; i < randomCount; i++) {
                        const randomIndex = Math.floor(Math.random() * emojiList.length);
                        randomEmojis.push(emojiList[randomIndex]);
                        // Remove used emoji to avoid duplicates
                        emojiList.splice(randomIndex, 1);
                    }
                    
                    const reactionText = randomEmojis.join('');
                    
                    await client.sendReaction(mek.key.remoteJid, reactionText, mek.key);
                    console.log(chalk.blue(`Reacted to status with: ${reactionText}`));
                }
            } catch (err) {
                console.error(chalk.red("Auto Like Status Error:"), err);
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
