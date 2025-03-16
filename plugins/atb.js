import config from "../../config.cjs";
import moment from "moment-timezone";

const autoBio = async (m, sock) => {
  const prefix = config.PREFIX;

  // Check if the command is "autobio"
  if (!m.body.startsWith(`${prefix}autobio`)) return;

  // Check if AUTO_BIO is enabled in the config
  if (!config.AUTO_BIO) {
    return await sock.sendMessage(
      m.from,
      { text: "*Auto Bio is disabled in the config.*" },
      { quoted: m }
    );
  }

  // Notify the user that Auto Bio is activated
  await sock.sendMessage(
    m.from,
    { text: "*Auto Bio activated! Your bio will update every minute.*" },
    { quoted: m }
  );

  // Function to update the bio
  const updateBio = async () => {
    const uptimeSeconds = process.uptime(); // Get bot uptime in seconds
    const hours = Math.floor(uptimeSeconds / 3600); // Calculate hours
    const minutes = Math.floor((uptimeSeconds % 3600) / 60); // Calculate minutes
    const seconds = Math.floor(uptimeSeconds % 60); // Calculate seconds
    const formattedUptime = `${hours}h ${minutes}m ${seconds}s`; // Format uptime

    const realTime = moment().tz("Africa/Nairobi").format("HH:mm:ss"); // Get current time in Nairobi timezone

    const newBio = `${formattedUptime} | Time: ${realTime}`; // Create the new bio

    try {
      await sock.updateProfileStatus(newBio); // Update the bio
      console.log(`*Bio updated: ${newBio}*`); // Log the update
    } catch (error) {
      console.error("❌ Failed to update bio:", error); // Log errors
    }
  };

  // Update the bio immediately and then every minute
  updateBio(); // Run once immediately
  setInterval(updateBio, 60000); // Run every 60 seconds (1 minute)
};

export default autoBio;
