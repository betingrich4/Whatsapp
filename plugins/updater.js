import config from '../config.cjs';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';

const updateCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd !== 'update') return;
  if (!isCreator) return m.reply("*ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ*");

  let responseMessage;

  try {
    await m.reply("```ᴄʜᴇᴄᴋɪɴɢ ғᴏʀ ᴅ3ᴍᴏɴ sʟᴀʏᴇʀ ᴜᴘᴅᴀᴛᴇs...```\n");

    // Get latest commit from GitHub
    const { data: commitData } = await axios.get("https://api.github.com/repos/JawadYTX/JAWAD-MD/commits/main");
    const latestCommitHash = commitData.sha;

    // Get current commit hash
    let currentHash = 'unknown';
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
      currentHash = packageJson.commitHash || 'unknown';
    } catch (error) {
      console.error("Error reading package.json:", error);
    }

    if (latestCommitHash === currentHash) {
      return m.reply("```✅ Your JAWAD-MD bot is already up-to-date!```\n");
    }

    await m.reply("```ᴅᴇᴍᴏɴ sʟᴀᴜᴇʀ ᴜᴘᴅᴀᴛɪɴɢ...```\n");

    // Download latest code
    const zipPath = path.join(process.cwd(), "latest.zip");
    const { data: zipData } = await axios.get("https://github.com/Demon-Slayer2/DEMONS-SLAYER-XMD/archive/main.zip", { responseType: "arraybuffer" });
    fs.writeFileSync(zipPath, zipData);

    await m.reply("```📦 Extracting the latest code...```\n");

    // Extract ZIP file
    const extractPath = path.join(process.cwd(), 'latest');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    await m.reply("```ʀᴇᴘʟᴀᴄɪɴɢ ғɪʟᴇ...```\n");

    // Copy updated files, skipping config.js and app.json
    const sourcePath = path.join(extractPath, "DEMONS-SLAYER-XMD-main");
    copyFolderSync(sourcePath, process.cwd());

    // Cleanup
    fs.unlinkSync(zipPath);
    fs.rmSync(extractPath, { recursive: true, force: true });

    responseMessage = "```ʙᴏᴛ sᴜᴄᴄᴇssғᴜʟʟʏ ᴜᴘᴅᴀᴛᴇᴅ,ɪᴛ ᴡɪʟʟ ʀᴇsᴛᴀʀᴛ sᴏᴏɴ...```";
    await m.reply(responseMessage);

    // Restart the bot after update
    exec("pm2 restart all", (error, stdout, stderr) => {
      if (error) {
        console.error(`Restart error: ${error.message}`);
        return;
      }
      if (stderr) console.error(`Restart stderr: ${stderr}`);
      console.log(`Restart stdout: ${stdout}`);
    });

  } catch (error) {
    console.error("Update error:", error);
    m.reply("❌ Update failed. Please try manually.");
  }
};

// Helper function to copy directories while preserving config.js and app.json
function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const srcPath = path.join(source, item);
    const destPath = path.join(target, item);

    // Skip config.js and app.json
    if (item === "config.js" || item === "app.json") {
      console.log(`Skipping ${item} to preserve custom settings.`);
      continue;
    }

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default updateCommand;
