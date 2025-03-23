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
import axios from 'axios';
import path from 'path';
import chalk from 'chalk';
import config from './config.cjs';

const prefix = process.env.PREFIX || config.PREFIX;
const sessionDir = path.join(process.cwd(), 'session');
const credsPath = path.join(sessionDir, 'creds.json');
const useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const warnUsers = new Map(); // Stores warnings for both Anti-Link & Anti-Bot violations

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
╰─────────────━┈⊷`
                    });
                    initialConnection = false;
                } else {
                    console.log(chalk.blue("♻️ Connection reestablished after restart."));
                }
            }
        });

        Matrix.ev.on('creds.update', saveCreds);

        // Anti-Link & Anti-Bot System
        Matrix.ev.on("messages.upsert", async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.message) return;
                if (mek.key.fromMe) return;

                const fromJid = mek.key.participant || mek.key.remoteJid;
                const textMessage = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
                const linkRegex = /(https?:\/\/[^\s]+)/gi;
                const botKeywords = ["!help", ".help", "!menu", ".menu", "bot", "prefix"]; // Common bot commands

                // Anti-Link Detection
                if (linkRegex.test(textMessage)) {
                    if (!warnUsers.has(fromJid)) {
                        warnUsers.set(fromJid, 1);
                        await Matrix.sendMessage(fromJid, { text: "⚠️ Warning! Sending links is not allowed. If you send another link, you will be removed." }, { quoted: mek });
                    } else {
                        warnUsers.set(fromJid, warnUsers.get(fromJid) + 1);
                        if (warnUsers.get(fromJid) >= 2) {
                            await Matrix.groupParticipantsUpdate(fromJid, [mek.key.participant], "remove");
                            warnUsers.delete(fromJid);
                        }
                    }
                    await Matrix.sendMessage(fromJid, { delete: mek.key });
                }

                // Anti-Bot Detection
                if (botKeywords.some(keyword => textMessage.toLowerCase().includes(keyword))) {
                    if (!warnUsers.has(fromJid)) {
                        warnUsers.set(fromJid, 1);
                        await Matrix.sendMessage(fromJid, { text: "⚠️ Warning! Using another bot in this group is not allowed. If you use your bot again, you will be removed." }, { quoted: mek });
                    } else {
                        warnUsers.set(fromJid, warnUsers.get(fromJid) + 1);
                        if (warnUsers.get(fromJid) >= 2) {
                            await Matrix.groupParticipantsUpdate(fromJid, [mek.key.participant], "remove");
                            warnUsers.delete(fromJid);
                        }
                    }
                    await Matrix.sendMessage(fromJid, { delete: mek.key });
                }

                await Handler(chatUpdate, Matrix, logger);
            } catch (err) {
                console.error('Error handling messages.upsert event:', err);
            }
        });

        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

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
        console.log("No session found. Please scan QR to log in.");
        await start();
    }
}

init();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
