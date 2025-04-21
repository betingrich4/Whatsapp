const fs = require("fs");
require("dotenv").config();

const config = {
  /* [SESSION CONFIGURATION] */
  SESSION_ID: process.env.SESSION_ID || "Demo-Slayer~4IxXzZSD#vr0cAFNJs7jgkSFKWAZQx_2FC99m5jbCnCRSbV19vvg",
  SESSION_NAME: process.env.SESSION_NAME || "Demon-Slayer",
  
  /* [BOT BASIC CONFIG] */
  PREFIX: process.env.PREFIX || '.',
  MODE: process.env.MODE || "public",
  BOT_NAME: process.env.BOT_NAME || "Demon-Slayer",
  BOT_STATUS: process.env.BOT_STATUS || "online",
  CAPTION: process.env.CAPTION || "Made By Marisel",
  OWNER_NAME: process.env.OWNER_NAME || "Marisel",
  TIME_ZONE: process.env.TIME_ZONE || "Africa/Nairobi", // Timezone for timestamps
  
  /* [OWNER CONFIGURATION] */
  OWNER_NUMBER: process.env.OWNER_NUMBER || "218942841878",
  SUDO_NUMBER: process.env.SUDO_NUMBER || "254740007567",
  CHANNEL_JID: process.env.CHANNEL_JID || "120363299029326322@newsletter",
  CHANNEL_NAME: process.env.CHANNEL_NAME || "𝖒𝖆𝖗𝖎𝖘𝖊𝖑",
  
  /* [STATUS FEATURES] */
  AUTO_STATUS: process.env.AUTO_STATUS === "true" || true,
  STATUS_TEXT: process.env.STATUS_TEXT || "Hey Guys this is the Best bot Master\nFollow his channel:\nhttps://whatsapp.com/channel/0029Vajvy2kEwEjwAKP4SI0x",
  STATUS_IMAGE_URL: process.env.STATUS_IMAGE_URL || "",
  AUTOLIKE_STATUS: process.env.AUTOLIKE_STATUS === "true" || true,
  AUTOLIKE_EMOJI: process.env.AUTOLIKE_EMOJI || "❤️",
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || 'Status Viewed',
  
  /* [AUTOMATION FEATURES] */
  AUTO_REACT: process.env.AUTO_REACT === "true" || false,
  AUTO_REPLY: process.env.AUTO_REPLY === "true" || false,
  AUTO_BIO: process.env.AUTO_BIO === "true" || true,
  AUTO_READ: process.env.AUTO_READ === "true" || false,
  AUTO_TYPING: process.env.AUTO_TYPING === "true" || false,
  AUTO_RECORDING: process.env.AUTO_RECORDING === "true" || false,
  AUTO_STICKER: process.env.AUTO_STICKER === "true" || false,
  AUTO_DL: process.env.AUTO_DL === "true" || false,
  
  /* [REACTION SETTINGS] */
  SLIKE: process.env.SLIKE === "true" || true,
  SLIKE_EMOJIS: process.env.SLIKE_EMOJIS ? process.env.SLIKE_EMOJIS.split(',') : ['❤️', '🔥', '😍', '💯', '✨', '😎'],
  
  /* [SECURITY FEATURES] */
  AUTO_BLOCK: process.env.AUTO_BLOCK === "true" || true,
  ANTI_LEFT: process.env.ANTI_LEFT === "true" || true,
  ANTI_GROUP_LEAVE: process.env.ANTI_GROUP_LEAVE || "true",
  ANTI_DELETE: process.env.ANTI_DELETE === "true" || true,
  BLOCKED_PREFIXES: process.env.BLOCKED_PREFIXES ? process.env.BLOCKED_PREFIXES.split(',') : ['234', '263', '91'],
  
  /* [CHAT FEATURES] */
  CHAT_BOT: process.env.CHAT_BOT === "true" || true,
  CHAT_BOT_MODE: process.env.CHAT_BOT_MODE || "self",
  WELCOME: process.env.WELCOME === "true" || true,
  NEW_CMD: process.env.NEW_CMD || "ᴀᴅᴅᴠᴀʀ\n│ sᴜᴅᴏ│ Marisel",
  
  /* [ADVANCED SETTINGS] */
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE === "true" || false,
  OWNER_REACT: process.env.OWNER_REACT === "true" || false,
  REJECT_CALL: process.env.REJECT_CALL === "true" || false,
  NOT_ALLOW: process.env.NOT_ALLOW === "true" || true,
  DELETED_MESSAGES_CHAT_ID: process.env.DELETED_MESSAGES_CHAT_ID || "254740007567@s.whatsapp.net",
  
  /* [API KEYS] */
  GEMINI_KEY: process.env.GEMINI_KEY || "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc",
  
  /* [DEBUGGING] */
  PLUGIN_LOG: process.env.PLUGIN_LOG === "true" || true,
  PLUGIN_SUCCESS_EMOJI: process.env.PLUGIN_SUCCESS_EMOJI || '✔',
  PLUGIN_FAIL_EMOJI: process.env.PLUGIN_FAIL_EMOJI || '❌',
  
  /* [NEWSLETTER CONFIG] */
  FORWARDED_SCORE: 999,
  SERVER_MESSAGE_ID: 143,
  
  /* [DEPLOYMENT NOTIFICATION] */
  DEPLOYMENT_NOTIFY: process.env.DEPLOYMENT_NOTIFY === "true" || true
};

// Export configuration
module.exports = config;
