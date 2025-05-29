export default async function handler(req, res) {
  const { home, away } = req.query;

  if (!home || !away) {
    return res.status(400).json({ error: 'Missing team IDs' });
  }

  const fetchPlayers = async (teamId) => {
    const url = `https://api-nba-v1.p.rapidapi.com/players?team=${teamId}&season=2024`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
        }
      });

      const json = await response.json();

      return json.response || [];
    } catch (err) {
      console.error(`❌ Error fetching players for team ${teamId}:`, err);
      return [];
    }
  };

  try {
    const [homePlayers, awayPlayers] = await Promise.all([
      fetchPlayers(home),
      fetchPlayers(away)
    ]);

    res.status(200).json({ homePlayers, awayPlayers });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
}
