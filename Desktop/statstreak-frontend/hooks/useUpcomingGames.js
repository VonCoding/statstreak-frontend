import { useEffect, useState } from 'react';

export default function useUpcomingGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        setGames(data.upcomingGames || []);
      } catch (err) {
        console.error('❌ Failed to fetch games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return { games, loading };
}
