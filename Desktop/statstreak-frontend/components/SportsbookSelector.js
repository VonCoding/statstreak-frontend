import { useState } from 'react';

export default function BookSelector({ onSelect }) {
  const [active, setActive] = useState("FanDuel");
  const books = ["FanDuel", "DraftKings", "PrizePicks"];

  function handleSelect(book) {
    setActive(book);
    onSelect(book);
  }

  return (
    <div className="flex justify-center gap-3 mb-6 flex-wrap">
      {books.map((book) => (
        <button
          key={book}
          onClick={() => handleSelect(book)}
          className={`
            px-4 py-2 rounded-full font-semibold text-sm transition
            ${active === book
              ? 'bg-[#FF9D00] text-white shadow-md'
              : 'bg-zinc-800 text-gray-300 hover:bg-[#FF9D00] hover:text-white'}
          `}
        >
          {book}
        </button>
      ))}
    </div>
  );
}
