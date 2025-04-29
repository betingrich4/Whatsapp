import moment from 'moment-timezone';
import config from '../config.cjs';
import chalk from 'chalk';
import { delay } from '@whiskeysockets/baileys';

const MASTER_NAME = "Marisel";
const TIMEZONE = config.TIME_ZONE || 'Africa/Tripoli';
let bioInterval;
let lastUpdateTime = 0;
const MIN_UPDATE_INTERVAL = 30000; // 30 seconds (WhatsApp's rate limit)

export const initAutoBio = async (Matrix) => {
    const updateBio = async () => {
        try {
            const now = Date.now();
            if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
                console.log(chalk.yellow('[AUTO-BIO] Skipping update due to rate limit'));
                return;
            }

            const currentTime = moment().tz(TIMEZONE);
            const timeStr = currentTime.format('HH:mm:ss');
            const dayStr = currentTime.format('dddd');
            const dateStr = currentTime.format('DD MMMM YYYY');
            const bioText = `⏰ ${timeStr} | ${dayStr} | 📅 ${dateStr} | ${MASTER_NAME}`;
            
            await Matrix.updateProfileStatus(bioText);
            lastUpdateTime = Date.now();
            console.log(chalk.green(`[AUTO-BIO] Updated: ${bioText}`));
            
            // Add small delay between updates
            await delay(500);
        } catch (error) {
            console.error(chalk.red('[AUTO-BIO] Error:'), error);
            // If rate limited, wait longer before retrying
            if (error.data === 429) {
                console.log(chalk.yellow('[AUTO-BIO] Rate limited, waiting 5 minutes'));
                await delay(300000); // 5 minutes
            }
        }
    };

    // First update immediately
    await updateBio();
    
    // Update every 30 seconds (respecting WhatsApp's rate limits)
    bioInterval = setInterval(updateBio, 30000);
    console.log(chalk.yellow('[AUTO-BIO] Safe updates started (every 30 seconds)'));
};

export const stopAutoBio = () => {
    if (bioInterval) {
        clearInterval(bioInterval);
        console.log(chalk.yellow('[AUTO-BIO] Stopped'));
    }
};
