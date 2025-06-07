// handler.js
import { serialize } from '../../lib/Serializer.js';
import path from 'path';
import fs from 'fs/promises';
import config from '../../config.cjs';
import { handleAntilink } from './antilink.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
export const getGroupAdmins = participants =>
  participants
    .filter(p => p.admin === 'superadmin' || p.admin === 'admin')
    .map(p => p.id);

const Handler = async (chatUpdate, sock, logger, store) => {
  try {
    if (chatUpdate.type !== 'notify') return;

    const m = serialize(
      JSON.parse(JSON.stringify(chatUpdate.messages[0])),
      sock,
      logger
    );
    if (!m.message) return;

    const participants = m.isGroup
      ? (await sock.groupMetadata(m.from)).participants
      : [];
    const groupAdmins = getGroupAdmins(participants);

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = m.isGroup && groupAdmins.includes(botId);
    const isUserAdmin = m.isGroup && groupAdmins.includes(m.sender);

    const PREFIX = /^[\\/!#.]/;
    const prefixMatch = PREFIX.test(m.body) ? m.body.match(PREFIX) : null;
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    if (m.key?.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
      await sock.readMessages([m.key]);
    }

    const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
    const botNumber = sock.decodeJid(sock.user.id);
    const isCreator = [ownerNumber, botNumber].includes(m.sender);

    if (!sock.public && !isCreator) return;

    await handleAntilink(m, sock, logger, isBotAdmin, isUserAdmin, isCreator);

    const pluginFiles = await fs.readdir(path.join(__dirname, '..', 'plugin'));
    for (const file of pluginFiles) {
      if (file.endsWith('.js')) {
        const pluginModule = await import(path.join(__dirname, '..', 'plugin', file));
        if (pluginModule.default) await pluginModule.default(m, sock);
      }
    }
  } catch (e) {
    console.error('🔴 Handler Error:', e);
  }
};

export default Handler;
