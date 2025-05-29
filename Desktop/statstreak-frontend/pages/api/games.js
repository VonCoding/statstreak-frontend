export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://api-nba-v1.p.rapidapi.com/games?season=2024',
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
        }
      }
    );

    const json = await response.json();
    const now = new Date();

    const upcomingGames = (json.response || [])
      .filter(game => {
        const gameDate = new Date(game.date.start);
        return (
          game.status?.long === "Scheduled" &&
          gameDate > now &&
          game.teams?.home?.nickname &&
          game.teams?.visitors?.nickname
        );
      })
      .sort((a, b) => new Date(a.date.start) - new Date(b.date.start))
      .slice(0, 3)
      .map(game => ({
        id: game.id,
        date: new Date(game.date.start).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
        teams: [
          game.teams.visitors.nickname,
          game.teams.home.nickname
        ],
        logos: [
          game.teams.visitors.logo,
          game.teams.home.logo
        ],
        slug: `${game.teams.visitors.nickname.toLowerCase()}-vs-${game.teams.home.nickname.toLowerCase()}`
      }));

    res.status(200).json({ upcomingGames });
  } catch (error) {
    console.error('❌ Error fetching upcoming games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
}
