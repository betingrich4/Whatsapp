const fs = require("fs");
require("dotenv").config();

// Configuration object with environment variables and default values
const config = {
  // Session and Bot Settings
  SESSION_ID: process.env.SESSION_ID || "Demon-Slayer~WZj0KrAR", // Session ID for the bot
  PREFIX: process.env.PREFIX || ".", // Command prefix for the bot
  BOT_NAME: process.env.BOT_NAME || "Demon Slayer", // Name of the bot
  CAPTION: process.env.CAPTION || "> *ᴍᴀᴅᴇ ʙʏ ᴄʀᴇᴡ sʟᴀʏᴇʀ*", // Caption for bot messages
  MODE: process.env.MODE || "private", // Bot mode: "public" or "private"

  // Status and Auto-Reply Settings
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN === 'true', // Automatically view statuses
  AUTOLIKE_STATUS: process.env.AUTOLIKE_STATUS === 'true', // Automatically like status updates
  AUTOLIKE_EMOJI: process.env.AUTOLIKE_EMOJI || '🫩', // Emoji for liking status updates
  AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS === 'true', // Automatically reply to status updates
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || "Status viewed", // Message for status viewed

  // Auto-Update Settings
  AUTO_BIO: process.env.AUTO_BIO === 'true', // Automatically update bot bio
  AUTO_DL: process.env.AUTO_DL === 'true', // Automatically download media
  AUTO_READ: process.env.AUTO_READ === 'true', // Automatically mark messages as read
  AUTO_TYPING: process.env.AUTO_TYPING === 'true', // Automatically show typing indicator
  AUTO_RECORDING: process.env.AUTO_RECORDING === 'true', // Automatically show recording indicator
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE === 'true', // Keep bot always online
  AUTO_REACT: process.env.AUTO_REACT === 'true', // Automatically react to messages

  // Security and Restrictions
  AUTO_BLOCK: process.env.AUTO_BLOCK === 'true', // Automatically block certain numbers
  ANTI_DELETE: process.env.ANTI_DELETE === 'true', // Prevent message deletion
  REJECT_CALL: process.env.REJECT_CALL === 'true', // Automatically reject calls
  NOT_ALLOW: process.env.NOT_ALLOW === 'true', // Restrict certain actions
  ANTILINK: process.env.ANTILINK === 'true', // Enable/disable antilink feature
 
  // Owner and Sudo Settings
  OWNER_NAME: process.env.OWNER_NAME || "Marisel", // Name of the bot owner
  OWNER_NUMBER: process.env.OWNER_NUMBER || "218942841878", // Phone number of the bot owner
  SUDO_NUMBER: process.env.SUDO_NUMBER || "254740007567", // Sudo user's phone number

  // AI and External Services
  GEMINI_KEY: process.env.GEMINI_KEY || "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc", // API key for Gemini AI

  // Welcome and Greetings
  WELCOME: process.env.WELCOME === 'true', // Enable welcome messages

  // Auto Status View and Reaction
  AUTO_STATUS_VIEW: process.env.AUTO_STATUS_VIEW === 'true', // Automatically view statuses
  AUTO_STATUS_REACTION: process.env.AUTO_STATUS_REACTION === 'true', // Automatically react to statuses
  STATUS_REACTION_EMOJI: process.env.STATUS_REACTION_EMOJI || '🫩', // Emoji for reacting to statuses
};

// Debugging: Log the AUTO_BIO value to ensure it's set correctly
console.log("AUTO_BIO from .env:", process.env.AUTO_BIO);
console.log("AUTO_BIO in config:", config.AUTO_BIO);

// Export the configuration object
module.exports = config;
