import config from "../config.cjs";
import chalk from "chalk";

let autoBioInterval = null; // To store the interval for auto-updating bio

const autoBio = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // Enable autobio
    if (cmd === "autobio on") {
      // Check if the command is sent by the bot owner
      const isOwner = [config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
      if (!isOwner) {
        return m.reply("*THIS IS AN OWNER COMMAND*");
      }

      // Start auto-updating bio
      if (!autoBioInterval) {
        autoBioInterval = setInterval(async () => {
          try {
            // Get current time and date in Africa/Nairobi timezone
            const now = new Date();
            const options = {
              timeZone: 'Africa/Nairobi',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            };
            
            const time = now.toLocaleTimeString('en-KE', options); // en-KE for Kenya English
            const day = now.toLocaleDateString('en-KE', { 
              timeZone: 'Africa/Nairobi',
              weekday: 'long' 
            });
            const date = now.toLocaleDateString('en-KE', {
              timeZone: 'Africa/Nairobi',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            // Create the bio message with Nairobi time
            const bioMessage = `${time} | ${day} | ${date} Marisel`;

            // Update the bot's profile bio
            await gss.updateProfileStatus(bioMessage);

            // Log the update
            console.log(chalk.green(`[Nairobi Time] Bot bio updated: ${bioMessage}`));
          } catch (error) {
            console.error("Error updating bio:", error);
          }
        }, 60000); // Update every 60 seconds

        return m.reply("*Auto-Bio is now activated.*\n\n> *The bot's profile bio will show current Nairobi time automatically.*");
      } else {
        return m.reply("*Auto-Bio is already active.*");
      }
    }

    // Disable autobio
    if (cmd === "autobio off") {
      // Check if the command is sent by the bot owner
      const isOwner = [config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
      if (!isOwner) {
        return m.reply("*📛 THIS IS AN OWNER COMMAND*");
      }

      // Stop auto-updating bio
      if (autoBioInterval) {
        clearInterval(autoBioInterval);
        autoBioInterval = null;
        return m.reply("*Auto-Bio is now disabled.*\n\n> *The bot's profile bio will no longer update automatically.*");
      } else {
        return m.reply("*Auto-Bio is already inactive.*");
      }
    }
  } catch (error) {
    console.error("Error in Auto-Bio:", error);
    m.reply("*⚠️ An error occurred while processing Auto-Bio.*\n\n> *Please try again later*");
  }
};

export default autoBio;
