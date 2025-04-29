import moment from 'moment-timezone';
import config from '../config.cjs';
import chalk from 'chalk';

const MASTER_NAME = "Marisel";
const TIMEZONE = config.TIME_ZONE || 'Africa/Nairobi';
let bioInterval;

export const initAutoBio = (Matrix) => {
    const updateBio = async () => {
        try {
            const now = moment().tz(TIMEZONE);
            const timeStr = now.format('HH:mm:ss');
            const dayStr = now.format('dddd');
            const dateStr = now.format('DD MMMM YYYY');
            const bioText = `⏰ ${timeStr} | ${dayStr} | 📅 ${dateStr} | ${MASTER_NAME}`;
            
            await Matrix.updateProfileStatus(bioText);
            console.log(chalk.green(`[AUTO-BIO] Updated: ${bioText}`));
        } catch (error) {
            console.error(chalk.red('[AUTO-BIO] Error:'), error);
        }
    };

    // First update immediately
    updateBio();
    
    // Update every second
    bioInterval = setInterval(updateBio, 1000);
    console.log(chalk.yellow('[AUTO-BIO] Service started'));
};

export const stopAutoBio = () => {
    if (bioInterval) {
        clearInterval(bioInterval);
        console.log(chalk.yellow('[AUTO-BIO] Service stopped'));
    }
};
