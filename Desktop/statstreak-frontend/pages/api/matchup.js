import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import boxiqData from '../../utils/boxiq_player_stats.json';
import dvpData from '../../utils/dvp_stats.json';
import playerImageMap from '../../utils/playerImageMap';
import teamMap from '../../utils/teamMap';

const TABS = ['points', 'rebounds', 'assists', 'fg3m'];

export default function MatchupPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [activeTab, setActiveTab] = useState('points');
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [playersA, setPlayersA] = useState([]);
  const [playersB, setPlayersB] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug || loading || error) return;

    const [slugA, slugB] = slug.split('-vs-');
    const teamAData = teamMap[slugA];
    const teamBData = teamMap[slugB];
    if (!teamAData || !teamBData) return;

    setTeamA(teamAData);
    setTeamB(teamBData);

    const teamAKey = teamAData.abbrev;
    const teamBKey = teamBData.abbrev;

    console.log('✅ Slug:', slug);
    console.log('✅ teamA:', teamAKey, 'teamB:', teamBKey);
    console.log('✅ boxiqData keys:', Object.keys(boxiqData));

    const aTeamPlayers = boxiqData[teamAKey] || [];
    const bTeamPlayers = boxiqData[teamBKey] || [];

    console.log('🧪 Players from A:', aTeamPlayers.map(p => p.player));
    console.log('🧪 Players from B:', bTeamPlayers.map(p => p.player));

    const aPlayers = aTeamPlayers
      .filter(p => p[`avg_${activeTab}`] !== undefined)
      .sort((a, b) => b[`avg_${activeTab}`] - a[`avg_${activeTab}`])
      .slice(0, 6);

    const bPlayers = bTeamPlayers
      .filter(p => p[`avg_${activeTab}`] !== undefined)
      .sort((a, b) => b[`avg_${activeTab}`] - a[`avg_${activeTab}`])
      .slice(0, 6);

    setPlayersA(aPlayers);
    setPlayersB(bPlayers);
  }, [slug, activeTab, boxiqData, loading, error]);

  const renderPlayerCard = (player) => {
    const img = playerImageMap[player.player];
    const dvp = dvpData?.[teamB?.abbrev]?.[player.position] || null;
    const avg = player[`avg_${activeTab}`]?.toFixed(1);
    const streak = player?.streaks?.[activeTab] || 'No recent streak';

    return (
      <div
        key={player.player}
        className="bg-[#111] border border-gray-700 rounded-lg px-4 py-3 flex flex-col items-center shadow-sm"
      >
        <img
          src={img}
          alt={player.player}
          className="w-16 h-16 object-cover rounded-full mb-2"
        />
        <div className="text-sm text-white font-semibold">{player.player}</div>
        <div className="text-xs text-gray-400">{player.position} • #{player.jersey}</div>
        <div className="text-md mt-1 text-orange-400 font-bold">{avg}</div>
        <details className="mt-2 w-full text-xs text-gray-300">
          <summary className="cursor-pointer">BoxIQ Insights</summary>
          <div className="mt-1">{streak}</div>
          {dvp && <div className="mt-1 text-[10px] text-yellow-400">Opponent DvP Rank: {dvp}</div>}
        </details>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-8">
      <h1 className="text-center text-2xl font-bold mb-4">
        {teamA?.name} vs {teamB?.name}
      </h1>

      <div className="flex justify-center mb-6 space-x-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              activeTab === tab ? 'bg-orange-500 text-black' : 'bg-[#1a1a1a] text-white'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="text-center text-sm font-bold">{teamA?.abbrev}</div>
          {playersA.length === 0 ? (
            <p className="text-center text-gray-500 text-xs">No players found for {teamA?.abbrev}</p>
          ) : (
            playersA.map(renderPlayerCard)
          )}
        </div>

        <div className="flex flex-col items-center justify-center text-xs text-gray-400">
          <span className="py-2 px-3 bg-[#111] rounded-full border border-gray-700 mb-2">
            StatStreak
          </span>
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm font-bold">{teamB?.abbrev}</div>
          {playersB.length === 0 ? (
            <p className="text-center text-gray-500 text-xs">No players found for {teamB?.abbrev}</p>
          ) : (
            playersB.map(renderPlayerCard)
          )}
        </div>
      </div>
    </div>
  );
}
