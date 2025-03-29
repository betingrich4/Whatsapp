import config from "../config.cjs";
import chalk from "chalk";

let autoBioInterval = null;

const autoBio = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    if (cmd === "autobio on") {
      if (!autoBioInterval) {
        autoBioInterval = setInterval(async () => {
          try {
            const now = new Date();
            
            // Format time (03:20:33)
            const time = now.toLocaleTimeString('en-KE', {
              timeZone: 'Africa/Nairobi',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false // Use 24-hour format
            }).replace(/\./g, ':'); // Fix formatting if needed

            // Format day (Saturday)
            const day = now.toLocaleDateString('en-KE', {
              timeZone: 'Africa/Nairobi',
              weekday: 'long'
            });

            // Format date (29 March 2025)
            const date = now.toLocaleDateString('en-KE', {
              timeZone: 'Africa/Nairobi',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            // Create clean bio message
            const bioMessage = `⏰ ${time} | ${day} | 📅 ${date} | Marisel`;

            await gss.updateProfileStatus(bioMessage);
            console.log(chalk.green(`[Nairobi Time] Bio updated: ${bioMessage}`));
          } catch (error) {
            console.error("Error updating bio:", error);
          }
        }, 60000);

        return m.reply("*Auto-Bio is now activated with proper formatting.*");
      }
      return m.reply("*Auto-Bio is already active.*");
    }

    if (cmd === "autobio off") {
      if (autoBioInterval) {
        clearInterval(autoBioInterval);
        autoBioInterval = null;
        return m.reply("*Auto-Bio disabled.*");
      }
      return m.reply("*Auto-Bio isn't active.*");
    }
  } catch (error) {
    console.error("Auto-Bio error:", error);
    m.reply("*⚠️ Bio update failed. Try again.*");
  }
};

export default autoBio;
