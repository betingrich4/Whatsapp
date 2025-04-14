const fs = require("fs");
require("dotenv").config();

const config = {
  SESSION_ID: process.env.SESSION_ID || "Demo-Slayer~4IxXzZSD#vr0cAFNJs7jgkSFKWAZQx_2FC99m5jbCnCRSbV19vvg",
  PREFIX: process.env.PREFIX || '.',

  // Bot Information
  BOT_NAME: process.env.BOT_NAME || "Demon-Slayer",
  BOT: process.env.BOT || "hello 👋",
  NEW_CMD: process.env.NEW_CMD || "ᴀᴅᴅᴠᴀʀ\n│ sᴜᴅᴏ│ Marisel",
  CAPTION: process.env.CAPTION || "Made By Marisel",

  // Status Features
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN !== undefined ? process.env.AUTO_STATUS_SEEN === 'true' : true,
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY !== undefined ? process.env.AUTO_STATUS_REPLY === 'true' : true,
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || 'Status Viewed',
  AUTOLIKE_STATUS: process.env.AUTOLIKE_STATUS !== undefined ? process.env.AUTOLIKE_STATUS === 'true' : true,
  AUTOLIKE_EMOJI: process.env.AUTOLIKE_EMOJI || '🐥',
  AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS !== undefined ? process.env.AUTO_REPLY_STATUS === 'true' : false,
  AUTO_STATUS_UPDATE: process.env.AUTO_STATUS_UPDATE !== undefined ? process.env.AUTO_STATUS_UPDATE === 'true' : true,
  STATUS_TEXT: process.env.STATUS_TEXT || "Hey Guys this is the Best bot Master\nFollow his channel:\nhttps://whatsapp.com/channel/0029Vajvy2kEwEjwAKP4SI0x",

  // Message Handling
  AUTO_DL: process.env.AUTO_DL !== undefined ? process.env.AUTO_DL === 'true' : false,
  AUTO_READ: process.env.AUTO_READ !== undefined ? process.env.AUTO_READ === 'true' : false,
  AUTO_TYPING: process.env.AUTO_TYPING !== undefined ? process.env.AUTO_TYPING === 'true' : false,
  AUTO_RECORDING: process.env.AUTO_RECORDING !== undefined ? process.env.AUTO_RECORDING === 'true' : false,
  AUTO_STICKER: process.env.AUTO_STICKER !== undefined ? process.env.AUTO_STICKER === 'true' : false,

  // Bot Behavior
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE !== undefined ? process.env.ALWAYS_ONLINE === 'true' : false,
  AUTO_REACT: process.env.AUTO_REACT !== undefined ? process.env.AUTO_REACT === 'true' : false,
  SLIKE: process.env.SLIKE !== undefined ? process.env.SLIKE === 'true' : true,
  SLIKE_EMOJIS: process.env.SLIKE_EMOJIS ? process.env.SLIKE_EMOJIS.split(',') : ['❤️', '🔥', '😍', '💯', '✨', '😎'],

  // Security Features
  AUTO_BLOCK: process.env.AUTO_BLOCK !== undefined ? process.env.AUTO_BLOCK === 'true' : true,
  ANTI_LEFT: process.env.ANTI_LEFT !== undefined ? process.env.ANTI_LEFT === 'true' : true,
  ANTI_GROUP_LEAVE: process.env.ANTI_GROUP_LEAVE || "true",
  ANTI_DELETE: process.env.ANTI_DELETE !== undefined ? process.env.ANTI_DELETE === 'true' : true,
  DELETE_PATH: process.env.DELETE_PATH || "pm",
  BLOCKED_PREFIXES: process.env.BLOCKED_PREFIXES ? process.env.BLOCKED_PREFIXES.split(',') : ['234', '263', '91'],

  // Chat Features
  CHAT_BOT: process.env.CHAT_BOT !== undefined ? process.env.CHAT_BOT === 'true' : true,
  CHAT_BOT_MODE: process.env.CHAT_BOT_MODE || "self",
  LYDEA: process.env.LYDEA !== undefined ? process.env.LYDEA === 'true' : true,

  // Owner Settings
  OWNER_REACT: process.env.OWNER_REACT !== undefined ? process.env.OWNER_REACT === 'true' : false,
  REJECT_CALL: process.env.REJECT_CALL !== undefined ? process.env.REJECT_CALL === 'true' : false,
  NOT_ALLOW: process.env.NOT_ALLOW !== undefined ? process.env.NOT_ALLOW === 'true' : true,
  MODE: process.env.MODE || "public",
  DELETED_MESSAGES_CHAT_ID: process.env.DELETED_MESSAGES_CHAT_ID || "254740007567@s.whatsapp.net",
  OWNER_NAME: process.env.OWNER_NAME || "Marisel",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "218942841878",
  SUDO_NUMBER: process.env.SUDO_NUMBER || "254740007567",

  // Other Services
  GEMINI_KEY: process.env.GEMINI_KEY || "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc",
  WELCOME: process.env.WELCOME !== undefined ? process.env.WELCOME === 'true' : false,
  AUTO_BIO: process.env.AUTO_BIO !== undefined ? process.env.AUTO_BIO === 'true' : true,

  // Plugin Loader Logs
  PLUGIN_LOG: process.env.PLUGIN_LOG !== undefined ? process.env.PLUGIN_LOG === 'true' : true,
  PLUGIN_SUCCESS_EMOJI: process.env.PLUGIN_SUCCESS_EMOJI || '✔',
  PLUGIN_FAIL_EMOJI: process.env.PLUGIN_FAIL_EMOJI || '❌'
};

module.exports = config;
