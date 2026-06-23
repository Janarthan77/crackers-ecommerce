"use client";

import { useState } from 'react';
import confetti from 'canvas-confetti';

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!liked) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x, y },
        colors: ['#D4AF37', '#FFD700', '#AA8222'],
        startVelocity: 30,
        scalar: 0.8,
        ticks: 100,
        zIndex: 9999
      });
    }
    
    setLiked(!liked);
  };

  return (
    <button
      onClick={handleLike}
      className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center bg-[#111111] border border-[#D4AF37]/30 shadow-md z-20 transition-all ${
        liked ? 'scale-110 border-[#D4AF37] bg-[#1A1A1A]' : 'hover:scale-110 hover:border-[#D4AF37]/60'
      }`}
      title={liked ? "Unlike" : "Like"}
    >
      {liked ? (
        <div className="relative flex items-center justify-center w-full h-full">
          <span className="text-red-500 text-lg z-10 relative drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]">❤️</span>
        </div>
      ) : (
        <span className="text-gray-400 text-lg opacity-70 hover:opacity-100 transition-opacity">🤍</span>
      )}
    </button>
  );
}
