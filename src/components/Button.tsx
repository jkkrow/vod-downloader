import { useState } from 'react';

export default function Button() {
  const [count, setCount] = useState(0);

  return (
    <button
      className="w-full h-full text-xl"
      onClick={() => setCount((prev) => prev + 1)}
    >
      {count}
    </button>
  );
}
