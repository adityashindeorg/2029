import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  colorIndex: number;
  size: number;
  popped: boolean;
  rotation: number;
  vRot: number;
}

export const NeonHeartFireworks: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const colors = ['#ff0055', '#ff00aa', '#ff3355', '#ff1177', '#ff5588', '#ff22aa'];
    
    // Pre-render hearts to offscreen canvases for 120fps performance
    // shadowBlur is very slow, so we do it once per color.
    const preRenderedHearts = colors.map(color => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 100;
      offCanvas.height = 100;
      const octx = offCanvas.getContext('2d')!;
      
      const cx = 50;
      const cy = 50;
      
      octx.translate(cx, cy);
      
      // Neon glow
      octx.shadowBlur = 15;
      octx.shadowColor = color;
      octx.fillStyle = color;
      
      octx.beginPath();
      octx.moveTo(0, 0);
      octx.bezierCurveTo(0, -10, -15, -10, -15, 0);
      octx.bezierCurveTo(-15, 10, 0, 20, 0, 25);
      octx.bezierCurveTo(0, 20, 15, 10, 15, 0);
      octx.bezierCurveTo(15, -10, 0, -10, 0, 0);
      octx.fill();
      octx.closePath();
      
      // Inner bright core
      octx.shadowBlur = 0;
      octx.fillStyle = '#ffffff';
      octx.globalAlpha = 0.8;
      octx.scale(0.5, 0.5);
      octx.beginPath();
      octx.moveTo(0, 0);
      octx.bezierCurveTo(0, -10, -15, -10, -15, 0);
      octx.bezierCurveTo(-15, 10, 0, 20, 0, 25);
      octx.bezierCurveTo(0, 20, 15, 10, 15, 0);
      octx.bezierCurveTo(15, -10, 0, -10, 0, 0);
      octx.fill();
      octx.closePath();
      
      return offCanvas;
    });

    let particles: Particle[] = [];

    const createExplosion = (x: number, y: number, count: number, sizeMult: number = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Higher speed for more dramatic explosion
        const speed = (Math.random() * 12 + 2) * sizeMult;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 60 + Math.random() * 60,
          colorIndex: Math.floor(Math.random() * colors.length),
          size: (Math.random() * 1.5 + 0.5) * sizeMult,
          popped: false,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2
        });
      }
    };

    // Initial explosion from center bottom
    createExplosion(width / 2, height / 2 + 100, 60, 1.2);

    let animationFrameId: number;
    let started = false;

    // Use a trailing array for manual motion blur that works with transparent backgrounds
    let trails: {x: number, y: number, colorIndex: number, size: number, alpha: number, rotation: number}[] = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw trails
      ctx.globalCompositeOperation = 'screen';
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.alpha -= 0.08; // Fade trail fast
        if (t.alpha <= 0) {
          trails.splice(i, 1);
          continue;
        }
        
        ctx.globalAlpha = t.alpha * 0.5; // subtle trail
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        ctx.scale(t.size * 0.8, t.size * 0.8);
        ctx.drawImage(preRenderedHearts[t.colorIndex], -50, -50);
        ctx.restore();
      }

      // Update and draw particles
      ctx.globalCompositeOperation = 'screen'; // Looks better for neon
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Save to trail
        if (p.life % 2 === 0) {
           trails.push({ x: p.x, y: p.y, colorIndex: p.colorIndex, size: p.size, alpha: 1 - p.life / p.maxLife, rotation: p.rotation });
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        
        // Air resistance
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        p.rotation += p.vRot;
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.size, p.size);
        ctx.drawImage(preRenderedHearts[p.colorIndex], -50, -50);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
      
      if (particles.length > 0) started = true;
      if (started && particles.length === 0 && trails.length === 0) {
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
      createExplosion(e.clientX, e.clientY, 20, 0.8);
      
      particles.forEach(p => {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        if (Math.sqrt(dx * dx + dy * dy) < 60 && !p.popped) {
          p.popped = true;
          p.maxLife = p.life; // Pop immediately
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
