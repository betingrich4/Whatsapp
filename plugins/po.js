import config from '../config.cjs';

const pollCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'poll') {
    if (!text.includes('|')) return m.reply("Usage: *poll Question = Option1 , Option2 , Option3*");

    let [question, ...options] = text.split('|').map((t) => t.trim());
    if (options.length < 2) return m.reply("*You need at least two options* for a poll.");

    await Matrix.sendMessage(m.from, {
      poll: {
        name: question,
        values: options
      }
    }, { quoted: m });
  }
};

export default pollCommand;
