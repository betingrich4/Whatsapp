import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
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
const PORT = process.env.PORT || 3000;

const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
logger.level = "trace";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Function to download session data
async function downloadSessionData() {
    if (!config.SESSION_ID) {
        console.error('⚠️ Please add your session to SESSION_ID env !!');
        return false;
    }
    const sessdata = config.SESSION_ID.split("Demon-Slayer~")[1];
    const url = `https://pastebin.com/raw/${sessdata}`;
    try {
        const response = await axios.get(url);
        await fs.promises.writeFile(credsPath, response.data);
        console.log("🔒 Session Successfully Loaded !!");
        return true;
    } catch (error) {
        console.error("⚠️ Failed to download session:", error);
        return false;
    }
}

// Function to update bot's bio/status with real-time Nairobi (EAT) time
async function updateBio(Matrix) {
    try {
        const bioText = `🤖 ${config.BOT_NAME} | 🕒 ${moment().tz("Africa/Nairobi").format("HH:mm:ss")}`;
        await Matrix.updateProfileStatus(bioText);
        console.log(chalk.green(`✅ Bio updated: ${bioText}`));
    } catch (error) {
        console.error(chalk.red('❌ Error updating bio:'), error);
    }
}

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`🤖 Demon Slayer using WA v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["Demon", "Safari", "3.3"],
            auth: state,
        });

        // Handle connection updates
        Matrix.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    console.log(chalk.yellow("⚠️ Reconnecting..."));
                    startBot();
                }
            } else if (connection === 'open') {
                console.log(chalk.green("✅ Demon Slayer Connected"));
                await Matrix.sendMessage(Matrix.user.id, { text: "🤖 Bot connected successfully!" });

                if (config.AUTO_BIO) {
                    await updateBio(Matrix);
                    setInterval(() => updateBio(Matrix), 10000); // Updates bio every 10 seconds
                }
            }
        });

        Matrix.ev.on('creds.update', saveCreds);

        // **Auto React to Messages**
        Matrix.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const mek = messages[0];

                if (!mek.key.fromMe && config.AUTO_REACT) {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await doReact(randomEmoji, mek, Matrix);
                }

                // **Auto Status View**
                if (config.AUTO_STATUS_VIEW && mek.key.remoteJid.endsWith('@broadcast') && (mek.message?.imageMessage || mek.message?.videoMessage)) {
                    try {
                        await Matrix.readMessages([mek.key]);
                        console.log(chalk.green(`✅ Viewed status from ${mek.key.participant || mek.key.remoteJid}`));
                    } catch (error) {
                        console.error('❌ Error marking status as viewed:', error);
                    }
                }

            } catch (err) {
                console.error('❌ Error in auto-reaction/status view:', err);
            }
        });

    } catch (error) {
        console.error('❌ Critical Error:', error);
        process.exit(1);
    }
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Session file found, proceeding without QR code.");
        await startBot();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            console.log("🔒 Session downloaded, starting bot.");
            await startBot();
        } else {
            console.log("⚠️ No session found, QR code will be printed for authentication.");
            useQR = true;
            await startBot();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.send('CONNECTED SUCCESSFULLY');
});

app.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});
