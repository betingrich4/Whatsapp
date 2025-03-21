import config from '../config.cjs';
import fetch from 'node-fetch';

const footballCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Football Data API configuration
  const apiKey = '7b6507c792f74a2b9db41cfc8fd8cf05'; // Replace with your actual API key
  const apiUrl = 'https://api.football-data.org/v4/competitions';

  // Helper function to fetch data from the Football Data API
  const fetchFootballData = async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          'X-Auth-Token': apiKey,
        },
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Helper function to fetch news from the News API
  const fetchNews = async (query) => {
    const newsUrl = `https://newsapi.org/v2/everything?q=${query}&apiKey=YOUR_NEWSAPI_KEY`; // Replace with your NewsAPI key
    try {
      const response = await fetch(newsUrl);
      const data = await response.json();
      if (data.status !== "ok") return null;
      return data.articles;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Helper function to fetch highlights (placeholder)
  const fetchHighlights = async (league) => {
    const highlightsUrl = `https://api.example.com/${league}-highlights`; // Replace with actual highlight API
    try {
      const response = await fetch(highlightsUrl);
      const data = await response.json();
      if (!data.highlights) return null;
      return data.highlights;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Handle Serie A commands
  if (cmd === 'seriea') {
    const subCommand = text.split(' ')[0];
    switch (subCommand) {
      case 'table':
        const standingsUrl = `${apiUrl}/SA/standings`;
        const standingsData = await fetchFootballData(standingsUrl);
        if (!standingsData || !standingsData.standings) {
          return m.reply('❌ Error fetching Serie A standings.');
        }
        const standings = standingsData.standings[0].table;
        let standingsMessage = "📊 *Serie A Table*\n";
        standings.forEach((team, index) => {
          standingsMessage += `${index + 1}. ${team.team.name} - ${team.points} Points\n`;
        });
        await Matrix.sendMessage(m.from, { text: standingsMessage }, { quoted: m });
        break;

      case 'matchday':
        const matchesUrl = `${apiUrl}/SA/matches`;
        const matchesData = await fetchFootballData(matchesUrl);
        if (!matchesData || !matchesData.matches) {
          return m.reply('❌ Error fetching Serie A matchday.');
        }
        const matches = matchesData.matches;
        let matchdayMessage = "🗓️ *Upcoming Serie A Matches*\n";
        matches.forEach(match => {
          matchdayMessage += `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.utcDate}\n`;
        });
        await Matrix.sendMessage(m.from, { text: matchdayMessage }, { quoted: m });
        break;

      case 'topscorer':
        const topScorerUrl = `${apiUrl}/SA/scorers`;
        const topScorerData = await fetchFootballData(topScorerUrl);
        if (!topScorerData || !topScorerData.scorers) {
          return m.reply('❌ Error fetching Serie A top scorers.');
        }
        const topScorers = topScorerData.scorers;
        let topScorerMessage = "🏆 *Serie A Top Scorers*\n";
        topScorers.forEach((scorer, index) => {
          topScorerMessage += `${index + 1}. ${scorer.player.name} - ${scorer.numberOfGoals} Goals\n`;
        });
        await Matrix.sendMessage(m.from, { text: topScorerMessage }, { quoted: m });
        break;

      case 'topassist':
        const topAssistUrl = `${apiUrl}/SA/assists`;
        const topAssistData = await fetchFootballData(topAssistUrl);
        if (!topAssistData || !topAssistData.assists) {
          return m.reply('❌ Error fetching Serie A top assists.');
        }
        const topAssists = topAssistData.assists;
        let topAssistMessage = "🎯 *Serie A Top Assists*\n";
        topAssists.forEach((assist, index) => {
          topAssistMessage += `${index + 1}. ${assist.player.name} - ${assist.numberOfAssists} Assists\n`;
        });
        await Matrix.sendMessage(m.from, { text: topAssistMessage }, { quoted: m });
        break;

      case 'news':
        const newsArticles = await fetchNews('Serie+A');
        if (!newsArticles) {
          return m.reply('❌ Error fetching Serie A news.');
        }
        let newsMessage = "📰 *Serie A News*\n";
        newsArticles.forEach((article, index) => {
          newsMessage += `${index + 1}. [${article.title}](${article.url})\n`;
        });
        await Matrix.sendMessage(m.from, { text: newsMessage }, { quoted: m });
        break;

      case 'highlights':
        const highlights = await fetchHighlights('sa');
        if (!highlights) {
          return m.reply('❌ No highlights found.');
        }
        let highlightsMessage = "🎬 *Serie A Highlights*\n";
        highlights.forEach((highlight, index) => {
          highlightsMessage += `${index + 1}. [Watch Highlight](${highlight.url})\n`;
        });
        await Matrix.sendMessage(m.from, { text: highlightsMessage }, { quoted: m });
        break;

      default:
        await m.reply('⚠️ Invalid Serie A command. Available commands: *table*, *matchday*, *topscorer*, *topassist*, *news*, *highlights*.');
        break;
    }
  }

  // Handle Premier League (EPL) commands
  if (cmd === 'epl') {
    const subCommand = text.split(' ')[0];
    switch (subCommand) {
      case 'table':
        const standingsUrl = `${apiUrl}/PL/standings`;
        const standingsData = await fetchFootballData(standingsUrl);
        if (!standingsData || !standingsData.standings) {
          return m.reply('❌ Error fetching EPL standings.');
        }
        const standings = standingsData.standings[0].table;
        let standingsMessage = "📊 *Premier League Table*\n";
        standings.forEach((team, index) => {
          standingsMessage += `${index + 1}. ${team.team.name} - ${team.points} Points\n`;
        });
        await Matrix.sendMessage(m.from, { text: standingsMessage }, { quoted: m });
        break;

      case 'matchday':
        const matchesUrl = `${apiUrl}/PL/matches`;
        const matchesData = await fetchFootballData(matchesUrl);
        if (!matchesData || !matchesData.matches) {
          return m.reply('❌ Error fetching EPL matchday.');
        }
        const matches = matchesData.matches;
        let matchdayMessage = "🗓️ *Upcoming EPL Matches*\n";
        matches.forEach(match => {
          matchdayMessage += `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.utcDate}\n`;
        });
        await Matrix.sendMessage(m.from, { text: matchdayMessage }, { quoted: m });
        break;

      case 'topscorer':
        const topScorerUrl = `${apiUrl}/PL/scorers`;
        const topScorerData = await fetchFootballData(topScorerUrl);
        if (!topScorerData || !topScorerData.scorers) {
          return m.reply('❌ Error fetching EPL top scorers.');
        }
        const topScorers = topScorerData.scorers;
        let topScorerMessage = "🏆 *EPL Top Scorers*\n";
        topScorers.forEach((scorer, index) => {
          topScorerMessage += `${index + 1}. ${scorer.player.name} - ${scorer.numberOfGoals} Goals\n`;
        });
        await Matrix.sendMessage(m.from, { text: topScorerMessage }, { quoted: m });
        break;

      case 'topassist':
        const topAssistUrl = `${apiUrl}/PL/assists`;
        const topAssistData = await fetchFootballData(topAssistUrl);
        if (!topAssistData || !topAssistData.assists) {
          return m.reply('❌ Error fetching EPL top assists.');
        }
        const topAssists = topAssistData.assists;
        let topAssistMessage = "🎯 *EPL Top Assists*\n";
        topAssists.forEach((assist, index) => {
          topAssistMessage += `${index + 1}. ${assist.player.name} - ${assist.numberOfAssists} Assists\n`;
        });
        await Matrix.sendMessage(m.from, { text: topAssistMessage }, { quoted: m });
        break;

      case 'news':
        const newsArticles = await fetchNews('Premier+League');
        if (!newsArticles) {
          return m.reply('❌ Error fetching EPL news.');
        }
        let newsMessage = "📰 *EPL News*\n";
        newsArticles.forEach((article, index) => {
          newsMessage += `${index + 1}. [${article.title}](${article.url})\n`;
        });
        await Matrix.sendMessage(m.from, { text: newsMessage }, { quoted: m });
        break;

      case 'highlights':
        const highlights = await fetchHighlights('epl');
        if (!highlights) {
          return m.reply('❌ No highlights found.');
        }
        let highlightsMessage = "🎬 *EPL Highlights*\n";
        highlights.forEach((highlight, index) => {
          highlightsMessage += `${index + 1}. [Watch Highlight](${highlight.url})\n`;
        });
        await Matrix.sendMessage(m.from, { text: highlightsMessage }, { quoted: m });
        break;

      default:
        await m.reply('⚠️ Invalid EPL command. Available commands: *table*, *matchday*, *topscorer*, *topassist*, *news*, *highlights*.');
        break;
    }
  }
};

export default footballCommand;
