
// components/OddsTable.js
import React from 'react';

export default function OddsTable({ odds = [], stats = [] }) {
  if (!odds.length) return <p className="text-gray-400">No odds available for this matchup and sportsbook.</p>;

  return (
    <div className="space-y-4">
      {odds.map((game, i) =>
        game.bookmakers?.flatMap(book =>
          book.markets?.flatMap(market =>
            market.outcomes.map((player, idx) => {
              const statMatch = stats.find(s =>
                s.player.toLowerCase().includes(player.name.toLowerCase())
              );

              return (
                <div key={i + '-' + idx} className="bg-[#122947] p-4 rounded shadow border border-[#1A2C4E] flex items-center space-x-4">
                  <img
                    src={`/players/${slugify(player.name)}.png`}
                    alt={player.name}
                    className="w-12 h-12 rounded-full border border-[#FF9D00] object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="flex-grow">
                    <p className="text-white font-semibold">{player.name}</p>
                    <p className="text-sm text-gray-400">
                      Line: <span className="text-[#FF9D00] font-medium">{player.point}</span>
                      {' · '}
                      Odds: {player.price > 0 ? '+' : ''}{player.price}
                    </p>
                    {statMatch && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        {statMatch.streak_note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )
        )
      )}
    </div>
  );
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
