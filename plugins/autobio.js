import config from '../config.cjs';
import { format } from 'date-fns';

const AUTO_BIO_ENABLED = true; // Set to false to disable
const MASTER_NAME = "Marisel";
const TIMEZONE = "Africa/Nairobi"; // Libya timezone (GMT+2)

const updateAutoBio = async (Matrix) => {
    if (!AUTO_BIO_ENABLED) return;

    const update = async () => {
        try {
            // Get current time in Libya
            const now = new Date();
            const options = { 
                timeZone: TIMEZONE,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            };
            
            const timeStr = now.toLocaleTimeString('en-US', options);
            const dateStr = now.toLocaleDateString('en-US', options);
            const dayStr = now.toLocaleDateString('en-US', { ...options, weekday: 'long' });
            
            // Format: ⏰ 23:03:54 | Monday | 📅 28 April 2025 | Marisel
            const newBio = `⏰ ${timeStr} | ${dayStr} | 📅 ${dateStr} | ${MASTER_NAME}`;
            
            await Matrix.updateProfileStatus(newBio);
            
        } catch (error) {
            console.error('AutoBio Error:', error);
        } finally {
            // Schedule next update in 1 second
            setTimeout(() => update(), 1000);
        }
    };

    // Initial update
    update();
};

// Start when bot is deployed
export const initAutoBio = (Matrix) => {
    updateAutoBio(Matrix);
    console.log('AutoBio service started');
};

// Command to manually refresh
const autobioCommand = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (cmd === 'autobio') {
        await updateAutoBio(Matrix);
        return m.reply("Bio updated successfully!");
    }
};

export default autobioCommand;
