import axios from 'axios';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

const Pair = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['pair', 'code', 'paircode'];

  if (validCommands.includes(cmd)) {
    if (!text) {
      return m.reply(`Hello *_${m.pushName}_*,\nHere's Example Usage: *${prefix}pair 254740007567*`);
    }

    try {
      await m.React('🚲');
      await m.reply('A moment, generating your pair code...');

      // Strict Kenyan number validation
      const phoneNumber = text.replace(/\D/g, '');
      if (!phoneNumber.match(/^254[17]\d{8}$/)) {
        return m.reply('Invalid number format. Use: *2547XXXXXXXX*');
      }

      // Only using your preferred API
      const apiUrl = `https://botto2-608d38531298.herokuapp.com/code?number=${phoneNumber}`;
      const response = await axios.get(apiUrl, { timeout: 8000 });

      if (response.data?.code) {
        const pairCode = response.data.code;
        
        await m.reply(`╭─────────────━┈⊷
│ *PAIR CODE GENERATED*
╰─────────────━┈⊷
📱 For: ${phoneNumber}
🔢 Code: ${pairCode}

Use in WhatsApp:
Linked Devices > Link a Device

> *© 3 MEN ARMY*`);
        await m.React('✅');
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Pair error:', error.message);
      await m.reply(`╭─────────────━┈⊷
│ *GENERATION FAILED*
╰─────────────━┈⊷
Server unavailable. Try again later.

> *© 3 MEN ARMY*`);
      await m.React('❌');
    }
  }
};

export default Pair;
