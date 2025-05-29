export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl text-orange-400 font-bold">Today's Top Picks</h1>
      <div className="mt-4 space-y-4">
        <div className="p-4 bg-zinc-800 rounded-lg shadow">
          <h2 className="text-xl">Luka Doncic</h2>
          <p className="text-sm text-orange-300">Line: 27.5 pts | Median: 29.2 pts → <strong>Take the OVER</strong></p>
        </div>
      </div>
    </div>
  );
}
