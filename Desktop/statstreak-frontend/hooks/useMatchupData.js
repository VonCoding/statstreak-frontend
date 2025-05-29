
import { useEffect, useState } from 'react';

export default function useMatchupData(slug, selectedBook = 'fanduel') {
  const [data, setData] = useState({ odds: [], stats: [], loading: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/matchup?slug=${slug}&book=${selectedBook}`);
        const json = await res.json();
        setData({ odds: json.odds || [], stats: json.stats || [], loading: false });
      } catch (err) {
        console.error('Failed to fetch matchup data:', err);
        setData({ odds: [], stats: [], loading: false });
      }
    };

    fetchData();
  }, [slug, selectedBook]);

  return data;
}
