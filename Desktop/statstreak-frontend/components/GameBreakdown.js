import { useState } from 'react';
import BookSelector from './BookSelector';

export default function GameBreakdown() {
  const [selectedBook, setSelectedBook] = useState("FanDuel");

  const players = [
    {
      name: "Anthony Edwards",
      team: "Timberwolves",
      position: "SG",
      odds: {
        FanDuel: "27.5",
        DraftKings: "28.0",
        PrizePicks: "27.0"
      },
      image: "/players/anthony-edwards.jpg"
    },
    {
      name: "LeBron James",
      team: "Lakers",
      position: "SF",
      odds: {
        FanDuel: "25.5",
        DraftKings: "26.0",
        PrizePicks: "25.0"
      },
      image: "/players/lebron-james.jpg"
    }
  ];

  return (
    <section className="bg-[#0B1D36] text-white px-6 py-10 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-[#FF9D00] text-center mb-2">Wolves vs Lakers</h2>
        <p className="text-center text-sm text-gray-400 mb-6">Wednesday 8:30 PM ET</p>

        <BookSelector onSelect={(book) => setSelectedBook(book)} />

        <div className="grid sm:grid-cols-2 gap-6">
          {players.map((player, idx) => (
            <div key={idx} className="bg-zinc-900 border border-[#1A2C4E] rounded-lg p-4 hover:shadow-lg transition">
              <img
                src={player.image}
                alt={player.name}
                className="w-20 h-20 object-cover rounded-full mx-auto mb-3"
              />
              <h3 className="text-lg font-semibold text-[#FF9D00] text-center">{player.name}</h3>
              <p className="text-sm text-gray-400 text-center mb-2">
                {player.position} • {player.team}
              </p>
              <p className="text-white text-center text-lg font-bold">
                Line: <span className="text-[#FF9D00]">{player.odds[selectedBook]}</span>
              </p>
              <a
                href={`/player/${player.name.toLowerCase().replace(/\\s+/g, "-")}?book=${selectedBook}`}
                className="block mt-3 text-center text-sm text-white hover:text-[#FF9D00] transition underline"
              >
                Check the stats to start the streak →
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-center italic text-gray-500">
          Where boxes beat books. Built for props. Made for streaks.
        </p>
      </div>
    </section>
  );
}
