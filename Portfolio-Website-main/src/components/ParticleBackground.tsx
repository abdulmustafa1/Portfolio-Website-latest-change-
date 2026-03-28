import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  originalX: number;
  originalY: number;
  baseVx: number;
  baseVy: number;
}

interface ParticleBackgroundProps {
  heroOnly?: boolean;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ heroOnly = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (heroOnly) {
        // Limit to hero section height (viewport height)
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      const colors = ['#14b8a6', '#8b5cf6', '#ec4899', '#06b6d4'];
      
      const particleCount = heroOnly ? 60 : 80;
      
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = heroOnly ? Math.random() * Math.min(canvas.height, window.innerHeight) : Math.random() * canvas.height;
        const baseVx = (Math.random() - 0.5) * 0.5;
        const baseVy = (Math.random() - 0.5) * 0.5;
        
        particles.push({
          x,
          y,
          originalX: x,
          originalY: y,
          vx: baseVx,
          vy: baseVy,
          baseVx,
          baseVy,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
      
      particlesRef.current = particles;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        // Calculate distance to mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse interaction effect
        if (distance < 150) {
          const force = (150 - distance) / 150;
          const repelX = -(dx / distance) * force * 3;
          const repelY = -(dy / distance) * force * 3;
          
          particle.vx = particle.baseVx + repelX;
          particle.vy = particle.baseVy + repelY;
        } else {
          // Gradually return to base velocity
          particle.vx += (particle.baseVx - particle.vx) * 0.05;
          particle.vy += (particle.baseVy - particle.vy) * 0.05;
        }
        
        // Apply movement
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary collision with velocity reversal
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.baseVx *= -1;
          particle.vx = particle.baseVx;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.baseVy *= -1;
          particle.vy = particle.baseVy;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });
      
      // Draw connections
      ctx.globalAlpha = 0.15;
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = 1 - (distance / 120);
            ctx.globalAlpha = opacity * 0.3;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = '#14b8a6';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed z-0 pointer-events-none ${
        heroOnly ? 'top-0 left-0 w-full h-screen' : 'inset-0'
      }`}
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;