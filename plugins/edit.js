import config from '../config.cjs';

const editQueue = new Map(); // Stores pending edit requests

const editMessage = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'edit') {
      if (!isCreator) {
        return m.reply("*ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ*");
      }

      if (!m.quoted) {
        return m.reply('Reply to the message you want to edit');
      }

      // Check if this is a follow-up message with new text
      if (editQueue.has(m.sender)) {
        const { originalMsgId } = editQueue.get(m.sender);
        
        await gss.sendMessage(m.from, {
          edit: {
            key: {
              remoteJid: m.from,
              id: originalMsgId,
              participant: m.sender
            },
            text: text
          }
        });

        // Clean up
        editQueue.delete(m.sender);
        await gss.sendMessage(m.from, { delete: m.key }); // Delete the edit command
        return;
      }

      // First time command - ask for new text
      const prompt = await m.reply('✏️ Reply with the new text for this message:');
      editQueue.set(m.sender, {
        originalMsgId: m.quoted.key.id,
        promptId: prompt.key.id
      });

      // Delete the prompt after 30 seconds if no response
      setTimeout(async () => {
        if (editQueue.has(m.sender)) {
          await gss.sendMessage(m.from, { delete: prompt.key });
          editQueue.delete(m.sender);
        }
      }, 30000);
    }
  } catch (error) {
    console.error('Error editing message:', error);
    
    // Clean up on error
    if (editQueue.has(m.sender)) {
      const { promptId } = editQueue.get(m.sender);
      await gss.sendMessage(m.from, { delete: promptId });
      editQueue.delete(m.sender);
    }
    
    m.reply('An error occurred while trying to edit the message.');
  }
};

export default editMessage;
