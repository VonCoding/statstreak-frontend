export default async function handler(req, res) {
  const { slug, book = 'fanduel' } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Missing matchup slug in query.' });
  }

  const [teamA, teamB] = slug.split('-vs-');
  const gameName = `${teamA} @ ${teamB}`;

  const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds-player-props/?regions=us&markets=points&bookmakers=${book}&apiKey=${process.env.ODDS_API_KEY}`;

  console.log("📡 Fetching from OddsAPI:", url);

  try {
    const oddsRes = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const raw = await oddsRes.text();
    console.log("📄 Raw Response Text:", raw);
    console.log("⛳ OddsAPI response status:", oddsRes.status);

    if (!oddsRes.ok) {
      return res.status(oddsRes.status).json({ error: "OddsAPI failed", detail: raw });
    }

    const oddsData = JSON.parse(raw);

    const filteredOdds = oddsData; // show all props for now

    const stats = [
      {
        player: "Anthony Edwards",
        points_avg: 24.8,
        rebounds_avg: 5.5,
        assists_avg: 4.1,
        streak_note: "3 games over 25+ points",
      },
      {
        player: "Jalen Brunson",
        points_avg: 28.3,
        rebounds_avg: 3.2,
        assists_avg: 6.7,
        streak_note: "Over 30 points in 5 of last 7",
      },
    ];

    res.status(200).json({
      odds: filteredOdds,
      stats,
    });
  } catch (err) {
    console.error("❌ OddsAPI Error:", err);
    res.status(500).json({ error: "Unexpected failure", detail: err.message });
  }
}
