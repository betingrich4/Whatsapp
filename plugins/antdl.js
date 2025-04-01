import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../config.cjs';

// Global toggle for anti-delete
let antiDeleteEnabled = false;
const messageCache = new Map();

const AntiDelete = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const text = m.body.slice(prefix.length).trim().split(' ');
    const cmd = text[0]?.toLowerCase();
    const subCmd = text[1]?.toLowerCase();

    // Cache all messages (for content recovery)
    Matrix.ev.on('messages.upsert', ({ messages }) => {
        if (!antiDeleteEnabled) return;
        
        messages.forEach(msg => {
            if (msg.key.fromMe || !msg.message) return;
            messageCache.set(msg.key.id, {
                content: msg.message.conversation || 
                        msg.message.extendedTextMessage?.text ||
                        (msg.message.imageMessage ? '[Image]' :
                         msg.message.videoMessage ? '[Video]' :
                         msg.message.audioMessage ? '[Audio]' :
                         '[Media Message]'),
                sender: msg.key.participant || msg.key.remoteJid,
                timestamp: new Date().toLocaleTimeString(),
                chatJid: msg.key.remoteJid
            });
        });
    });

    // Handle anti-delete commands
    if (cmd === 'antidelete') {
        try {
            if (subCmd === 'on') {
                antiDeleteEnabled = true;
                await m.reply(`╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *GLOBAL ACTIVATION*
┃▸└───────────···๏
╰────────────────┈⊷
Anti-delete protection is now *ACTIVE* in:
✦ All Groups
✦ Private Chats
✦ Every conversation

> *© 3 MEN ARMY*`);
                await m.React('✅');
            } 
            else if (subCmd === 'off') {
                antiDeleteEnabled = false;
                messageCache.clear();
                await m.reply(`╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *GLOBAL DEACTIVATION*
┃▸└───────────···๏
╰────────────────┈⊷
Anti-delete protection is now *DISABLED* everywhere.

> *© 3 MEN ARMY*`);
                await m.React('✅');
            }
            else {
                await m.reply(`╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *SYSTEM CONTROL*
┃▸└───────────···๏
╰────────────────┈⊷
*${prefix}antidelete on* - Activate everywhere
*${prefix}antidelete off* - Deactivate everywhere

Current Status: ${antiDeleteEnabled ? '✅ ACTIVE' : '❌ INACTIVE'}

> *© 3 MEN ARMY*`);
                await m.React('ℹ️');
            }
            return;
        } catch (error) {
            console.error('AntiDelete Command Error:', error);
            await m.React('❌');
        }
    }

    // Handle message deletions globally when enabled
    Matrix.ev.on('messages.update', async (update) => {
        if (!antiDeleteEnabled) return;

        try {
            for (const item of update) {
                const { key, update: { message: deletedMessage } } = item;
                if (key.fromMe) continue;
                
                const cachedMsg = messageCache.get(key.id);
                if (!cachedMsg) continue;

                const sender = cachedMsg.sender.split('@')[0];
                const chatName = key.remoteJid.endsWith('@g.us') 
                    ? (await Matrix.groupMetadata(key.remoteJid).catch(() => ({ subject: 'Group Chat' }))).subject
                    : 'Private Chat';

                await Matrix.sendMessage(key.remoteJid, { 
                    text: `╭━━━〔 *ANTI-DELETE* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *DELETION ALERT* 
┃▸└───────────···๏
╰────────────────┈⊷
╭━━〔 *Context* 〕━━┈⊷
┇๏ *Chat:* ${chatName}
┇๏ *Sender:* @${sender}
┇๏ *Deleted At:* ${new Date().toLocaleTimeString()}
╰━━━━━━━━━━━━──┈⊷
╭━━〔 *Original Message* 〕━━┈⊷
┇๏ ${cachedMsg.content}
╰━━━━━━━━━━━━──┈⊷
> *Marisel*`,
                    mentions: [cachedMsg.sender]
                });

                messageCache.delete(key.id);
            }
        } catch (error) {
            console.error('Anti-Delete Handler Error:', error);
        }
    });
};

export default AntiDelete;
