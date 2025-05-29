import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import boxiqData from '../../utils/boxiq_player_stats.json';
import playerImageMap from '../../utils/playerImageMap';
import teamMap from '../../utils/teamMap';
import dvpData from '../../utils/dvp_stats.json';

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
  const [inputs, setInputs] = useState({});
  const [ouSelect, setOuSelect] = useState({});
  const [predictions, setPredictions] = useState({});

  useEffect(() => {
    if (!slug) return;
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
  }, [slug, activeTab]);

  const statTabs = ['points', 'rebounds', 'assists', 'fg3m'];

  const calculatePrediction = (player, category, line, odds, choice, opponentAbbrev) => {
    const avg = player[`avg_${category}`];
    const streak = player.streaks?.[category] || '';
    const dvpValue = dvpData?.[opponentAbbrev]?.[category] || 0;

    const oddsVal = Math.abs(parseInt(odds) || 0);
    const deviation = avg - line;
    const absDeviation = Math.abs(deviation);

    // Base confidence influenced by how far the line is from the average
    let baseConfidence = Math.min(99, Math.max(30, (absDeviation / (avg || 1)) * 100));
    // Adjust based on odds
    baseConfidence += Math.min(20, oddsVal / 10);
    // Factor in DvP - lower = tougher defense
    baseConfidence += dvpValue > 0 ? (dvpValue < 5 ? -5 : dvpValue < 10 ? 0 : 5) : 0;

    const recommend = deviation >= 0 ? 'under' : 'over';
    const explanation = [
      `📊 Avg ${category}: ${avg.toFixed(1)}`,
      streak ? `🔥 Streak: ${streak}` : '',
      dvpValue ? `🛡️ DvP Rank: ${dvpValue} vs ${category}` : '',
      recommend === choice
        ? `✅ BoxIQ agrees with your pick — we like the ${choice.toUpperCase()} here.`
        : `⚠️ BoxIQ recommends the **${recommend.toUpperCase()}** based on recent trends.`
    ]
      .filter(Boolean)
      .join('\n');

    return {
      confidence: Math.round(baseConfidence),
      recommendation: recommend,
      explanation
    };
  };

  const renderPlayerCard = (player, teamKey) => {
    const slug = getSlugFromName(player.player);
    const inputKey = `${teamKey}-${slug}`;
    const input = inputs[inputKey] || {};
    const line = parseFloat(input.line);
    const odds = input.odds;
    const choice = ouSelect[inputKey];
    const result = predictions[inputKey];

    const streakStat = player.streaks?.[activeTab];
    const streakNote = streakStat || `Solid contributor in ${activeTab}`;

    const opponentAbbrev = teamKey === 'teamA' ? teamB?.abbrev : teamA?.abbrev;

    return (
      <div key={slug} className="bg-[#132C4D] p-4 rounded-lg flex items-center space-x-4">
        <img
          src={playerImageMap[slug] || '/default-headshot.png'}
          alt={player.player}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="w-full">
          <p className="font-semibold">{player.player}</p>
          <p className="text-sm text-gray-300">
            Avg {activeTab}: {player[`avg_${activeTab}`]}
          </p>
          <details className="text-sm mt-1 text-gray-400">
            <summary className="cursor-pointer">BoxIQ Insights</summary>
            <div className="mt-2">
              <p className="mb-1">{streakNote}</p>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="number"
                  placeholder="Line"
                  className="bg-[#0B1D36] text-white text-xs border border-[#FF9D00] px-2 py-1 rounded w-16"
                  value={input.line || ''}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [inputKey]: { ...prev[inputKey], line: e.target.value }
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Odds"
                  className="bg-[#0B1D36] text-white text-xs border border-[#FF9D00] px-2 py-1 rounded w-16"
                  value={input.odds || ''}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [inputKey]: { ...prev[inputKey], odds: e.target.value }
                    }))
                  }
                />
                <div className="flex space-x-1">
                  <button
                    className={`px-3 py-1 text-xs rounded-full border ${
                      choice === 'over'
                        ? 'bg-[#FF9D00] text-black'
                        : 'bg-transparent text-[#FF9D00] border-[#FF9D00]'
                    }`}
                    onClick={() =>
                      setOuSelect((prev) => ({ ...prev, [inputKey]: 'over' }))
                    }
                  >
                    Over
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full border ${
                      choice === 'under'
                        ? 'bg-[#FF9D00] text-black'
                        : 'bg-transparent text-[#FF9D00] border-[#FF9D00]'
                    }`}
                    onClick={() =>
                      setOuSelect((prev) => ({ ...prev, [inputKey]: 'under' }))
                    }
                  >
                    Under
                  </button>
                </div>
                <button
                  className="bg-[#FF9D00] text-black text-xs px-2 py-1 rounded font-bold"
                  onClick={() => {
                    if (line && odds && choice) {
                      const prediction = calculatePrediction(
                        player,
                        activeTab,
                        line,
                        odds,
                        choice,
                        opponentAbbrev
                      );
                      setPredictions((prev) => ({ ...prev, [inputKey]: prediction }));
                    }
                  }}
                >
                  GO
                </button>
              </div>

              {result && (
                <div className="mt-2 text-xs text-[#FF9D00]">
                  <p>
                    🧠 <strong>BoxIQ Confidence:</strong> {result.confidence}% — Recommends{' '}
                    <strong>{result.recommendation.toUpperCase()}</strong>
                  </p>
                  <pre className="whitespace-pre-wrap text-gray-300 mt-1">{result.explanation}</pre>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    );
  };

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
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              activeTab === tab ? 'bg-[#FF9D00] text-black' : 'bg-[#122947] text-gray-300'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {playersA.map((p) => renderPlayerCard(p, 'teamA'))}
        </div>
        <div className="space-y-4">
          {playersB.map((p) => renderPlayerCard(p, 'teamB'))}
        </div>
      </div>
    </div>
  );
}
