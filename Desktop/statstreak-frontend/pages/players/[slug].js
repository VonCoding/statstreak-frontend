
import { useRouter } from 'next/router';
import playerImageMap from '../../utils/playerImageMap';

const playerData = {
  'anthony-edwards': {
    name: 'Anthony Edwards',
    stat: 'Points',
    line: 24.5,
    median: 26.2,
    recommendation: 'Take the OVER',
    note: 'He’s been heating up lately and facing a poor perimeter defense.',
    team: 'Minnesota Timberwolves',
    opponent: 'Dallas Mavericks',
    gameTime: '9:00 PM ET'
  },
  'jalen-brunson': {
    name: 'Jalen Brunson',
    stat: 'Points',
    line: 28.0,
    median: 27.1,
    recommendation: 'Lean UNDER',
    note: 'Tough matchup against a strong perimeter defense.',
    team: 'New York Knicks',
    opponent: 'Indiana Pacers',
    gameTime: '7:30 PM ET'
  },
  'tyrese-haliburton': {
    name: 'Tyrese Haliburton',
    stat: 'Assists',
    line: 9.5,
    median: 10.1,
    recommendation: 'Take the OVER',
    note: 'Great matchup for assist potential.',
    team: 'Indiana Pacers',
    opponent: 'New York Knicks',
    gameTime: '7:30 PM ET'
  }
};

export default function PlayerPage() {
  const { query } = useRouter();
  const player = playerData[query.slug];

  if (!player) {
    return (
      <div className="min-h-screen bg-[#0B1D36] text-white flex items-center justify-center">
        <p className="text-xl">Player data not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1D36] text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-[#FF9D00] mb-2">{player.name}</h1>
      <img
        src={playerImageMap[query.slug]}
        alt={player.name}
        className="w-28 h-28 rounded-full object-cover border-2 border-[#FF9D00] mb-4"
      />
      <p className="text-lg text-gray-300 mb-2">{player.team} vs {player.opponent}</p>
      <p className="text-sm text-gray-400 mb-4">Game Time: {player.gameTime}</p>

      <div className="bg-[#132542] p-6 rounded shadow max-w-md w-full text-center">
        <p className="text-xl font-semibold text-white mb-2">{player.stat} Line: <span className="text-[#FF9D00]">{player.line}</span></p>
        <p className="text-sm text-gray-400 mb-2">Season Median: {player.median}</p>
        <p className="text-md text-[#FF9D00] font-bold mb-2">{player.recommendation}</p>
        <p className="text-sm text-gray-300">{player.note}</p>
      </div>
    </div>
  );
}
