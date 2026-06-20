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
        colors: ['#ff0000', '#ff69b4', '#ff1493'],
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
      className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md z-20 transition-transform ${
        liked ? 'scale-110' : 'hover:scale-110'
      }`}
      title={liked ? "Unlike" : "Like"}
    >
      {liked ? (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* A proper GIF or animated content for the like action */}
          <img 
            src="https://media.giphy.com/media/LpDmM2wSt6Vk5qcCR9/giphy.gif" 
            alt="Liked" 
            className="w-10 h-10 object-cover absolute mix-blend-multiply"
            style={{ pointerEvents: 'none' }}
          />
          <span className="text-red-500 text-lg z-10 relative">❤️</span>
        </div>
      ) : (
        <span className="text-gray-400 text-lg">🤍</span>
      )}
    </button>
  );
}
