import config from '../../config.cjs';

const autoBioHandler = async (m, gss) => {
  // Only process if autoBio is enabled
  if (!global.db.data.settings[gss.user.jid]?.autoBio) return;

  try {
    // Get uptime
    const uptime = await getUptime();
    const formattedUptime = formatUptime(uptime);

    // Update bio with formatted string
    const newBio = `\nActive: ${formattedUptime}\n\n ┃ ${config.BOT_NAME}`;
    await gss.updateProfileStatus(newBio).catch(console.error);

    // Update last status change time
    global.db.data.settings[gss.user.jid].status = Date.now();

  } catch (error) {
    console.error('AutoBio Update Error:', error);
  }
};

async function getUptime() {
  if (process.send) {
    try {
      process.send('uptime');
      return await new Promise(resolve => {
        process.once('message', resolve);
        setTimeout(() => resolve(0), 1000); // Default to 0 if timeout
      });
    } catch (error) {
      console.error('Uptime Fetch Error:', error);
      return 0;
    }
  }
  return process.uptime() * 1000; // Fallback to process uptime
}

function formatUptime(ms) {
  if (isNaN(ms) || ms <= 0) return '--:--:--';

  const days = Math.floor(ms / 86400000);
  const hours = Math.floor(ms / 3600000) % 24;
  const minutes = Math.floor(ms / 60000) % 60;
  const seconds = Math.floor(ms / 1000) % 60;

  return [
    days > 0 ? `${days} Day(s)` : '',
    `${hours.toString().padStart(2, '0')} Hour(s)`,
    `${minutes.toString().padStart(2, '0')} Minute(s)`,
    `${seconds.toString().padStart(2, '0')} Second(s)`
  ].filter(Boolean).join(' ');
}

// Set handler to run on all messages
autoBioHandler.all = true;

export default autoBioHandler;
