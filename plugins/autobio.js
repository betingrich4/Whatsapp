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
            // Get current time and day
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const day = now.toLocaleDateString([], { weekday: "long" });

            // Create the bio message with a custom prefix
            const bioMessage = `Its  | ${time} | ${day}`;

            // Update the bot's profile bio
            await gss.updateProfileStatus(bioMessage);

            // Log the update
            console.log(chalk.green(`Bot bio updated: ${bioMessage}`));
          } catch (error) {
            console.error("Error updating bio:", error);
          }
        }, 5000); // Update every 5 seconds

        return m.reply("*Auto-Bio is now activated.*\n\n> *The bot's profile bio will be updated automatically with the current time and day.*");
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
        return m.reply("*Auto-Bio is now disabled.*\n\n> *The bot's profile bio will no longer be updated automatically.*");
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
