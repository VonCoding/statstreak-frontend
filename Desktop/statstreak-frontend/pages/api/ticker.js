export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://api.the-odds-api.com/v4/sports/basketball_nba/injuries?apiKey=c02368cd5570cbea46e9162f3394f88'
    );

    console.log('OddsAPI response status:', response.status);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch data from OddsAPI' });
    }

    const data = await response.json();

    res.status(200).json({ ticker: data });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
