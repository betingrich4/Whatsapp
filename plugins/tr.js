import config from '../../config.cjs';

const translate = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['translate', 'trt'];
    if (!validCommands.includes(cmd)) return;

    const args = text.split(' ');
    if (args.length < 2) {
      return m.reply(
        `❌ *Usage:* ${prefix}translate <text> <language code>\n` +
        `*Example:*\n` +
        `${prefix}translate hello my name is Demon-Slayer en`
      );
    }

    const query = args.slice(0, -1).join(' ');
    const lang = args[args.length - 1];

    // Show translating indicator
    await m.reply('Translating...');

    const translatedText = await fetchTranslation(query, lang);
    if (!translatedText) {
      return m.reply('❌ No translation found or invalid language code');
    }

    m.reply(`*Translation:*\n\n${translatedText}`);

  } catch (error) {
    console.error('Translate Error:', error);
    m.reply('❌ An error occurred while translating');
  }
};

async function fetchTranslation(query, lang) {
  if (!query.trim()) return "";
  
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.append("client", "gtx");
  url.searchParams.append("sl", "auto");
  url.searchParams.append("dt", "t");
  url.searchParams.append("tl", lang);
  url.searchParams.append("q", encodeURIComponent(query));

  try {
    const response = await fetch(url.href);
    const data = await response.json();
    return data?.[0]?.map(([[translation]]) => translation).join(" ") || "";
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

export default translate;
