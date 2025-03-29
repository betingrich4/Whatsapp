import config from "../config.cjs";
import chalk from "chalk";

let autoBioInterval = null;

const autoBio = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable autobio (every second)
    if (cmd === "autobio on") {
      if (!autoBioInterval) {
        autoBioInterval = setInterval(async () => {
          try {
            const now = new Date();
            const options = {
              timeZone: 'Africa/Nairobi',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false // 24-hour format (03:20:33 instead of 3:20:33 AM)
            };

            // Format time (HH:MM:SS)
            const time = now.toLocaleTimeString('en-KE', options);
            
            // Format day (e.g., Saturday)
            const day = now.toLocaleDateString('en-KE', {
              timeZone: 'Africa/Nairobi',
              weekday: 'long'
            });

            // Format date (e.g., 29 March 2025)
            const date = now.toLocaleDateString('en-KE', {
              timeZone: 'Africa/Nairobi',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            // Final bio message
            const bioMessage = `⏰ ${time} | ${day} | 📅 ${date} | Marisel`;

            // Update bio
            await gss.updateProfileStatus(bioMessage);
            console.log(chalk.green(`[Bio Updated] ${bioMessage}`));
          } catch (error) {
            console.error("Error updating bio:", error);
          }
        }, 1000); // ⚡ Update every 1000ms (1 second) instead of 60000ms (60 seconds)
        
        return m.reply("*Auto-Bio is now updating every second!*");
      } else {
        return m.reply("*Auto-Bio is already running.*");
      }
    }

    // Disable autobio
    if (cmd === "autobio off") {
      if (autoBioInterval) {
        clearInterval(autoBioInterval);
        autoBioInterval = null;
        return m.reply("*Auto-Bio stopped.*");
      } else {
        return m.reply("*Auto-Bio isn't active.*");
      }
    }
  } catch (error) {
    console.error("Auto-Bio Error:", error);
    m.reply("⚠️ *Failed to update bio. Try again.*");
  }
};

export default autoBio;
