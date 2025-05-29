// pages/index.js

import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import useUpcomingGames from '../hooks/useUpcomingGames';

export default function Home() {
  const { games, loading } = useUpcomingGames();

  const injuries = [
    { name: "Aaron Nesmith", position: "SF", status: "Day-to-day", reason: "Ankle" },
    { name: "Jayson Tatum", position: "PG", status: "Out for season", reason: "Lower leg" },
    { name: "LaMelo Ball", position: "PG", status: "Out for season", reason: "Ankle" },
    { name: "Kyrie Irving", position: "PG", status: "Out for season", reason: "Knee" },
    { name: "Isaiah Jackson", position: "C", status: "Out for season", reason: "Calf" }
  ];

  return (
    <>
      <Head>
        <title>StatStreak - Where Boxes Beat Books</title>
      </Head>

      <div className="min-h-screen bg-[#0B1D36] text-white font-sans">
        {/* Header */}
        <header className="w-full px-6 py-4 border-b border-[#1A2C4E] flex justify-between items-center">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FF9D00] tracking-tight">StatStreak</h1>
            <p className="text-sm sm:text-base text-gray-300">Where Boxes Beat Books.</p>
          </div>
          <button className="bg-[#FF9D00] text-[#0B1D36] font-semibold px-4 py-2 rounded hover:bg-orange-400 transition text-sm">
            Sign In
          </button>
        </header>

        {/* Featured Matchups */}
        <section className="py-10 px-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Featured Matchups</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {loading ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : games.length === 0 ? (
              <p className="text-center text-gray-400">No upcoming games found.</p>
            ) : (
              games.map((game, idx) => (
                <Link href={`/matchup/${game.slug}`} key={idx} passHref>
                  <div className="cursor-pointer bg-[#122947] hover:border-[#FF9D00] transition border border-[#1A2C4E] p-6 rounded-lg w-full max-w-md text-center">
                    <img src={game.logos[0]} alt={game.teams[0]} className="w-12 h-12 inline mr-4" />
                    <img src={game.logos[1]} alt={game.teams[1]} className="w-12 h-12 inline" />
                    <p className="mt-2 font-semibold text-lg text-white">
                      {game.teams[0]} vs {game.teams[1]}
                    </p>
                    <p className="text-sm text-gray-400">{game.date}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Injury Ticker */}
        <section className="relative overflow-hidden border-y border-[#1A2C4E] py-2 bg-[#0B1D36]">
          <div className="animate-marquee glow-pulse whitespace-nowrap text-[#FF9D00] text-sm font-semibold px-6">
            {injuries.map((inj, i) => (
              <span key={i} className="mx-6">
                {inj.name} ({inj.position}) – {inj.status} · {inj.reason}
              </span>
            ))}
          </div>
        </section>

        {/* Media / Blog Articles */}
        <section className="py-10 px-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Latest Articles & Betting Notes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#122947] p-5 rounded border border-[#1A2C4E]">
              <h3 className="text-[#FF9D00] font-semibold text-lg mb-2">Brunson's Rise: A Deep Dive</h3>
              <p className="text-gray-400 text-sm">Knicks guard continues to light up defenses — what it means for postseason value.</p>
            </div>
            <div className="bg-[#122947] p-5 rounded border border-[#1A2C4E]">
              <h3 className="text-[#FF9D00] font-semibold text-lg mb-2">Edwards at Home: Data-Driven Edge?</h3>
              <p className="text-gray-400 text-sm">When Ant plays in Minnesota, the numbers suggest you should take notice.</p>
            </div>
            <div className="bg-[#122947] p-5 rounded border border-[#1A2C4E]">
              <h3 className="text-[#FF9D00] font-semibold text-lg mb-2">Is OKC Peaking Too Soon?</h3>
              <p className="text-gray-400 text-sm">Thunder have won 7 of their last 8. We explore the sustainability behind the streak.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-[#1A2C4E]">
          &copy; {new Date().getFullYear()} StatStreak. Built for props. Made for streaks.
        </footer>
      </div>
    </>
  );
}
