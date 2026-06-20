"use client";

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  color: string;
}

export default function FireworksCanvas({ className = "fixed inset-0 pointer-events-none z-0" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      if (canvas.parentElement && className.includes('absolute')) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    updateSize();

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    const colors = [
      '#FFD700', '#FF6B00', '#FF0000', '#FF69B4',
      '#00BFFF', '#39FF14', '#FF4500', '#FFE55C',
      '#FF1493', '#ADFF2F', '#FFA500', '#FFFFFF'
    ];

    const createExplosion = (x: number, y: number, baseColor: string) => {
      const numParticles = Math.floor(Math.random() * 40) + 40;
      for (let i = 0; i < numParticles; i++) {
        const angle = (Math.PI * 2 / numParticles) * i + (Math.random() * 0.5);
        const speed = Math.random() * 6 + 2;
        const life = Math.random() * 80 + 60;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          maxLife: life,
          color: Math.random() > 0.4 ? baseColor : colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 1,
        });
      }
    };

    // Randomly fire rockets from the bottom
    const launchRocketInterval = setInterval(() => {
      const x = Math.random() * canvas.width;
      // Target height should be in the top 70% of the screen
      const targetY = Math.random() * (canvas.height * 0.6) + canvas.height * 0.1;
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      
      rockets.push({
        x,
        y: canvas.height + 10,
        targetY,
        speed: Math.random() * 6 + 8,
        color: baseColor,
      });
    }, 800);

    let animId: number;

    const animate = () => {
      // Clean up cleanly so no traces or dark film are left behind
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Process and draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y -= r.speed;

        // Draw rocket body
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
        
        // Draw rocket tail/sparks
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + r.speed * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Explode if reached target
        if (r.y <= r.targetY) {
          createExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Process and draw explosion particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.vx *= 0.98;
        p.life--;

        const alpha = Math.max(0, p.life / p.maxLife);

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size * alpha), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size * 0.5 * alpha), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (p.life <= 0) particles.splice(i, 1);
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(launchRocketInterval);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [className]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
