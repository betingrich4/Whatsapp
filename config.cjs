const fs = require("fs");
require("dotenv").config();

// Configuration object with environment variables and default values
const config = {
  // Session and Bot Settings
  SESSION_ID: process.env.SESSION_ID || "Demon-Slayer~WZj0KrAR",
  PREFIX: process.env.PREFIX || ".",
  BOT_NAME: process.env.BOT_NAME || "Demon Slayer",
  CAPTION: process.env.CAPTION || "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ*",
  MODE: process.env.MODE || "private",

  // Status and Auto-Reply Settings
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN === 'true',
  AUTO_STATUS_REACTION: process.env.AUTO_STATUS_REACTION === 'true',  // Auto react to statuses
  AUTOLIKE_EMOJI: process.env.AUTOLIKE_EMOJI || '🐥',  // Default reaction emoji
  AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS === 'true',
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || "Status viewed",

  // Auto-Update Settings
  AUTO_BIO: process.env.AUTO_BIO === 'true',
  AUTO_DL: process.env.AUTO_DL === 'true',
  AUTO_READ: process.env.AUTO_READ === 'true',
  AUTO_TYPING: process.env.AUTO_TYPING === 'true',
  AUTO_RECORDING: process.env.AUTO_RECORDING === 'true',
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE === 'true',
  AUTO_REACT: process.env.AUTO_REACT === 'true',

  // Security and Restrictions
  AUTO_BLOCK: process.env.AUTO_BLOCK === 'true',
  ANTI_DELETE: process.env.ANTI_DELETE === 'true',
  REJECT_CALL: process.env.REJECT_CALL === 'true',
  NOT_ALLOW: process.env.NOT_ALLOW === 'true',

  // Owner and Sudo Settings
  OWNER_NAME: process.env.OWNER_NAME || "Marisel",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "218942841878",
  SUDO_NUMBER: process.env.SUDO_NUMBER || "254740007567",

  // AI and External Services
  GEMINI_KEY: process.env.GEMINI_KEY || "AIzaSyCUPaxfIdZawsKZKqJcC-GWiQPCXKTDc",

  // Welcome and Greetings
  WELCOME: process.env.WELCOME === 'true',
};

console.log("AUTO_BIO from .env:", process.env.AUTO_BIO);
console.log("AUTO_BIO in config:", config.AUTO_BIO);

module.exports = config;
