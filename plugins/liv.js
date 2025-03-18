import axios from 'axios';

const FOOTBALL_API_KEY = '27b59ee9c666ce2a2d960e6a83765649'; // Your API key
const FOOTBALL_API_URL = 'https://v3.football.api-sports.io/fixtures';

async function getTodaysMatches() {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  try {
    const response = await axios.get(FOOTBALL_API_URL, {
      params: { date: today },
      headers: { 'x-rapidapi-key': FOOTBALL_API_KEY },
    });
    return response.data.response; // Array of matches
  } catch (error) {
    console.error('Error fetching matches:', error);
    return null;
  }
}

// Function to format matches into a message
function formatMatches(matches) {
  if (!matches || matches.length === 0) {
    return 'No matches found for today.';
  }

  let message = '*Today\'s Football Matches*\n\n';
  matches.forEach((match) => {
    const league = match.league.name;
    const homeTeam = match.teams.home.name;
    const awayTeam = match.teams.away.name;
    const time = new Date(match.fixture.date).toLocaleTimeString();
    message += `${league}: ${homeTeam} vs ${awayTeam} at ${time}\n`;
  });

  return message;
}

// Add the football command to your bot
const test = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'football') {
    const matches = await getTodaysMatches();
    const message = formatMatches(matches);
    await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
  }
};

export default test;
