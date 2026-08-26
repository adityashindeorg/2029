import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  popped: boolean;
}

export const NeonHeartFireworks: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles: Particle[] = [];
    const colors = ['#ff0055', '#ff00aa', '#ff3355', '#ff1177', '#ff5588', '#ff22aa'];

    const createExplosion = (x: number, y: number, count: number, sizeMult: number = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 * sizeMult;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 50 + Math.random() * 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: (Math.random() * 12 + 6) * sizeMult,
          popped: false,
        });
      }
    };

    // Initial explosion
    createExplosion(width / 2, height / 2 + 50, 40, 1.5);

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 30, size / 30);
      
      // Neon glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(0, -10, -15, -10, -15, 0);
      ctx.bezierCurveTo(-15, 10, 0, 20, 0, 25);
      ctx.bezierCurveTo(0, 20, 15, 10, 15, 0);
      ctx.bezierCurveTo(15, -10, 0, -10, 0, 0);
      ctx.fill();
      ctx.closePath();
      
      // Inner bright core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.scale(0.4, 0.4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(0, -10, -15, -10, -15, 0);
      ctx.bezierCurveTo(-15, 10, 0, 20, 0, 25);
      ctx.bezierCurveTo(0, 20, 15, 10, 15, 0);
      ctx.bezierCurveTo(15, -10, 0, -10, 0, 0);
      ctx.fill();
      ctx.closePath();
      
      ctx.restore();
    };

    let animationFrameId: number;
    // A flag to ensure we don't close immediately if particles take a frame to spawn
    let started = false;

    const render = () => {
      // Motion blur effect with transparent background
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = 1 - p.life / p.maxLife;
        drawHeart(ctx, p.x, p.y, p.size, p.color);
      }

      animationFrameId = requestAnimationFrame(render);
      
      if (particles.length > 0) started = true;
      if (started && particles.length === 0) {
        onClose();
      }
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleClick = (e: MouseEvent) => {
      // Pop interaction
      createExplosion(e.clientX, e.clientY, 15, 0.8);
      
      // Also check if we clicked near any existing particles to pop them
      particles.forEach(p => {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        if (Math.sqrt(dx * dx + dy * dy) < 50 && !p.popped) {
          p.popped = true;
          p.maxLife = p.life; // Kill immediately
        }
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onClose]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'auto',
        zIndex: 9999,
        cursor: 'crosshair',
      }}
    />
  );
};
