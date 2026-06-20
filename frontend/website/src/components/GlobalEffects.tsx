"use client";

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function GlobalEffects() {
  useEffect(() => {
    const handleBlast = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('a') || target.closest('button');
      
      if (clickable && e.type === 'click') {
        const rect = clickable.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x, y },
          colors: ['#FFD700', '#FF6B00', '#FF0000', '#00BFFF', '#39FF14'],
          startVelocity: 35,
          gravity: 1.2,
          scalar: 0.9,
          ticks: 150,
          zIndex: 9999
        });
      }
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('a') || target.closest('button');
      
      if (clickable && !clickable.hasAttribute('data-hovered')) {
        clickable.setAttribute('data-hovered', 'true');
        
        const rect = clickable.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
          particleCount: 15,
          spread: 40,
          origin: { x, y },
          colors: ['#FFA500', '#FF4500'],
          startVelocity: 15,
          gravity: 0.8,
          scalar: 0.6,
          ticks: 60,
          disableForReducedMotion: true,
          zIndex: 9999
        });

        const resetHover = () => {
          clickable.removeAttribute('data-hovered');
          clickable.removeEventListener('mouseleave', resetHover);
        };
        clickable.addEventListener('mouseleave', resetHover);
      }
    };

    document.addEventListener('click', handleBlast);
    document.addEventListener('mouseover', handleHover);

    return () => {
      document.removeEventListener('click', handleBlast);
      document.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return null;
}
