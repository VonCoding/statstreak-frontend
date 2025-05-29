// pages/api/injuries.js

headers: {
  'X-RapidAPI-Key': '4f07fe5986mshae6a883dc4095f8p138cbfjsn01452a875590',
  'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com',
}

let cachedInjuries = null;
let lastFetched = null;

export default async function handler(req, res) {
  const now = Date.now();
  const FOUR_DAYS_MS = 1000 * 60 * 60 * 24 * 4;

  if (cachedInjuries && lastFetched && now - lastFetched < FOUR_DAYS_MS) {
    return res.status(200).json({ injuries: cachedInjuries });
  }

  try {
    const response = await fetch('https://api-nba-v1.p.rapidapi.com/injuries', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': process.env.RAPID_API_HOST,
      },
    });

    const data = await response.json();
    const filtered = data.response
      .filter(p => p.team && p.player && p.description)
      .slice(0, 4) // Keep it concise

    cachedInjuries = filtered;
    lastFetched = now;

    res.status(200).json({ injuries: filtered });
  } catch (err) {
    console.error('Error fetching injuries:', err);
    res.status(500).json({ error: 'Failed to fetch injuries' });
  }
}
