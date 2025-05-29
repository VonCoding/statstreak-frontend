'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import teamMap from '../../utils/teamMap';
import playerImageMap from '../../utils/playerImageMap';

function getSlugFromName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

export default function MatchupPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [playersA, setPlayersA] = useState([]);
  const [playersB, setPlayersB] = useState([]);
  const [activeTab, setActiveTab] = useState('points');
  const [boxiqData, setBoxiqData] = useState({});
  const [dvpData, setDvpData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await fetch('https://boxiq-api.onrender.com/player-stats');
        const playerStats = await res1.json();
        const res2 = await fetch('https://boxiq-api.onrender.com/dvp-stats');
        const dvpStats = await res2.json();
        setBoxiqData(playerStats);
        setDvpData(dvpStats);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load matchup data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!slug || loading || error) return;

    const [slugA, slugB] = slug.split('-vs-');
    const teamAData = teamMap[slugA];
    const teamBData = teamMap[slugB];
    if (!teamAData || !teamBData) return;

    setTeamA(teamAData);
    setTeamB(teamBData);

    const aPlayers = (boxiqData[teamAData.abbrev] || [])
      .sort((a, b) => b[`avg_${activeTab}`] - a[`avg_${activeTab}`])
      .slice(0, 6);
    const bPlayers = (boxiqData[teamBData.abbrev] || [])
      .sort((a, b) => b[`avg_${activeTab}`] - a[`avg_${activeTab}`])
      .slice(0, 6);

    setPlayersA(aPlayers);
    setPlayersB(bPlayers);
  }, [slug, activeTab, boxiqData, loading, error]);

  const statTabs = ['points', 'rebounds', 'assists', 'fg3m'];

  const renderPlayerCard = (player) => {
    const slug = getSlugFromName(player.player);
    const streak = player.streaks?.[activeTab] || `Solid contributor in ${activeTab}`;
    return (
      <div key={slug} className="bg-[#132C4D] p-4 rounded-lg flex items-center space-x-4">
        <img
          src={playerImageMap[slug] || '/default-headshot.png'}
          alt={player.player}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{player.player}</p>
          <p className="text-sm text-gray-300">Avg {activeTab}: {player[`avg_${activeTab}`]}</p>
          <details className="text-sm mt-1 text-gray-400">
            <summary className="cursor-pointer">BoxIQ Insight</summary>
            <div className="mt-2">{streak}</div>
          </details>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1D36] text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#FF9D00] mb-4"></div>
        <p>Loading matchup data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1D36] text-red-500 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1D36] text-white p-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        {teamA?.name} vs {teamB?.name}
      </h1>

      <div className="flex justify-center mb-6 space-x-4">
        {statTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-[#FF9D00] text-black' : 'bg-[#1A365D] text-white'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2 text-center">{teamA?.abbrev}</h2>
          <div className="space-y-4">{playersA.map(renderPlayerCard)}</div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 text-center">{teamB?.abbrev}</h2>
          <div className="space-y-4">{playersB.map(renderPlayerCard)}</div>
        </div>
      </div>
    </div>
  );
}
