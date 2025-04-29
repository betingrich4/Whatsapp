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
import { initAutoBio, stopAutoBio } from './plugins/autobio.js';

const { emojis, doReact } = pkg;
const prefix = process.env.PREFIX || config.PREFIX;
const sessionName = "session";
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

// Deployment tracking system
const deploymentLogFile = 'deployment_log.json';
let dailyDeployments = 0;
let totalDeployments = 0;

// Load deployment data
if (fs.existsSync(deploymentLogFile)) {
    const data = JSON.parse(fs.readFileSync(deploymentLogFile, 'utf-8'));
    const today = moment().tz(config.TIME_ZONE || 'Africa/Nairobi').format('YYYY-MM-DD');
    dailyDeployments = data.date === today ? data.dailyCount : 0;
    totalDeployments = data.totalCount || 0;
}

const MAIN_LOGGER = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
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
    if (!config.SESSION_ID) {
        console.error('Please add your session to SESSION_ID env !!');
        return false;
    }

    const sessdata = config.SESSION_ID.split("Demo-Slayer~")[1];
    if (!sessdata || !sessdata.includes("#")) {
        console.error('Invalid SESSION_ID format!');
        return false;
    }

    const [fileID, decryptKey] = sessdata.split("#");
    try {
        console.log("Downloading Session...");
        const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);
        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => err ? reject(err) : resolve(data));
        });
        await fs.promises.writeFile(credsPath, data);
        console.log("Session Successfully Loaded !!");
        return true;
    } catch (error) {
        console.error('Failed to download session:', error);
        return false;
    }
}

async function sendDeploymentNotification(Matrix) {
    if (!config.OWNER_NUMBER) {
        console.log(chalk.yellow('Owner number not configured'));
        return;
    }
    
    const now = moment().tz(config.TIME_ZONE || 'Africa/Nairobi');
    const today = now.format('YYYY-MM-DD');
    dailyDeployments++;
    totalDeployments++;
    
    fs.writeFileSync(deploymentLogFile, JSON.stringify({
        date: today,
        dailyCount: dailyDeployments,
        totalCount: totalDeployments
    }));
    
    const notificationMessage = `🚀 *New Bot Deployment Alert* 🚀
📅 *Date:* ${now.format('Do MMMM YYYY')}
⏰ *Time:* ${now.format('h:mm:ss A')}
📱 *User Number:* ${Matrix.user.id.split('@')[0]}
🤖 *Bot Name:* ${config.BOT_NAME || "Demon-Slayer"}
📊 *Deployment Stats:*
* Today: ${dailyDeployments}
* Total: ${totalDeployments}
> *Prefix:* \`${prefix}\`
> *Mode:* ${config.MODE || "public"}`;

    await Matrix.sendMessage(
        `${config.OWNER_NUMBER}@s.whatsapp.net`, 
        { 
            text: notificationMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.CHANNEL_JID || '120363299029326322@newsletter',
                    newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                    serverMessageId: Math.floor(Math.random() * 1000) + 1
                }
            }
        }
    );
}

async function start() {
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
            return { conversation: "whatsapp user bot" };
        }
    });

    Matrix.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            stopAutoBio();
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                start();
            }
        } else if (connection === 'open') {
            if (initialConnection) {
                console.log(chalk.green("✓ Connected Successfully"));
                initAutoBio(Matrix);
                
                await Matrix.sendMessage(Matrix.user.id, {
                    image: { url: "https://files.catbox.moe/wwl2my.jpg" },
                    caption: `*Hello Demon-Slayer Connected*\n*Enjoy Using the Bot*\n\n> *Prefix = ${prefix}*\n> *Made By Marisel*\n📅 *Date:* ${moment().tz(config.TIME_ZONE || 'Africa/Nairobi').format('Do MMMM YYYY')}`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: config.CHANNEL_JID || '120363299029326322@newsletter',
                            newsletterName: config.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
                            serverMessageId: 143
                        }
                    }
                });
                
                await sendDeploymentNotification(Matrix);
                initialConnection = false;
            }
        }
    });

    Matrix.ev.on('creds.update', saveCreds);
    Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
    Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
    Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

    if (config.MODE === "public") Matrix.public = true;
    if (config.MODE === "private") Matrix.public = false;

    Matrix.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.key.fromMe && config.AUTO_REACT) {
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await doReact(randomEmoji, mek, Matrix);
            }
        } catch (err) {
            console.error('Auto react error:', err);
        }
    });

    Matrix.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
                const jawadlike = await Matrix.decodeJid(Matrix.user.id);
                const emojiList = ['❤️', '💸', '😇', '🍂', '💥'];
                const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                await Matrix.readMessages([mek.key]);
                await Matrix.sendMessage(mek.key.remoteJid, {
                    react: { text: randomEmoji, key: mek.key }
                }, { statusJidList: [mek.key.participant, jawadlike] });
            }
        } catch (err) {
            console.error("Status react error:", err);
        }
    });
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Session file found");
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) await start();
        else {
            useQR = true;
            await start();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.redirect('https://in-kappa.vercel.app/');
});

app.listen(PORT, () => {
    console.log(chalk.green(`🌐 Server running on port ${PORT}`));
});
