import React, { useState, useEffect } from 'react';

// Main particle burst - now more dramatic
const Particles = ({ active, color = '#22c55e', count = 20, duration = 1200 }) => {
  const [particles, setParticles] = useState([]);
  const [rings, setRings] = useState([]);

  useEffect(() => {
    if (active) {
      // Create expanding ring burst
      setRings([
        { id: 'ring-1', delay: 0, color },
        { id: 'ring-2', delay: 100, color },
        { id: 'ring-3', delay: 200, color },
      ]);

      // Create multiple waves of particles
      const wave1 = Array.from({ length: count }, (_, i) => ({
        id: `w1-${Date.now()}-${i}`,
        angle: (360 / count) * i + Math.random() * 20 - 10,
        distance: 60 + Math.random() * 50,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 100,
        duration: duration + Math.random() * 400,
        type: ['sparkle', 'star', 'dot', 'diamond'][Math.floor(Math.random() * 4)],
        wave: 1,
      }));

      const wave2 = Array.from({ length: Math.floor(count / 2) }, (_, i) => ({
        id: `w2-${Date.now()}-${i}`,
        angle: (360 / (count / 2)) * i + Math.random() * 30,
        distance: 80 + Math.random() * 40,
        size: 3 + Math.random() * 4,
        delay: 150 + Math.random() * 150,
        duration: duration + 200 + Math.random() * 300,
        type: ['sparkle', 'dot'][Math.floor(Math.random() * 2)],
        wave: 2,
      }));

      setParticles([...wave1, ...wave2]);

      const timer = setTimeout(() => {
        setParticles([]);
        setRings([]);
      }, duration + 800);

      return () => clearTimeout(timer);
    }
  }, [active, count, duration, color]);

  if (!particles.length && !rings.length) return null;

  const renderParticle = (particle) => {
    switch (particle.type) {
      case 'sparkle':
        return (
          <svg viewBox="0 0 24 24" fill={color} className="w-full h-full" style={{ filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})` }}>
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 24 24" fill={color} className="w-full h-full" style={{ filter: `drop-shadow(0 0 8px ${color})`, animation: 'sparkleRotate 0.6s linear infinite' }}>
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        );
      case 'diamond':
        return (
          <svg viewBox="0 0 24 24" fill={color} className="w-full h-full" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
            <path d="M12 2L22 12L12 22L2 12L12 2Z" />
          </svg>
        );
      default:
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 ${particle.size * 3}px ${color}, 0 0 ${particle.size * 6}px ${color}`,
            }}
          />
        );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {/* Expanding burst rings */}
      {rings.map((ring) => (
        <div
          key={ring.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: 20,
            height: 20,
            borderColor: ring.color,
            animation: `burstRing 600ms ease-out forwards`,
            animationDelay: `${ring.delay}ms`,
            boxShadow: `0 0 10px ${ring.color}, inset 0 0 10px ${ring.color}`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const x = Math.cos(radians) * particle.distance;
        const y = Math.sin(radians) * particle.distance;

        return (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2"
            style={{
              width: particle.size,
              height: particle.size,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              animation: `particleBurst ${particle.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              animationDelay: `${particle.delay}ms`,
              '--tx': `${x}px`,
              '--ty': `${y}px`,
            }}
          >
            {renderParticle(particle)}
          </div>
        );
      })}
    </div>
  );
};

// Dramatic leaf burst with swirl effect
export const LeafParticles = ({ active, count = 12 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const emojis = ['🍃', '🌿', '✨', '💚', '🌱'];
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: `leaf-${Date.now()}-${i}`,
        startX: Math.random() * 60 - 30,
        startY: Math.random() * 40 - 20,
        endX: Math.random() * 160 - 80,
        endY: Math.random() * 160 - 80,
        rotation: Math.random() * 1080 - 540,
        delay: Math.random() * 300,
        duration: 1400 + Math.random() * 800,
        size: 14 + Math.random() * 10,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 2500);
      return () => clearTimeout(timer);
    }
  }, [active, count]);

  if (!particles.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute left-1/2 top-1/2"
          style={{
            fontSize: particle.size,
            animation: `leafFall ${particle.duration}ms ease-out forwards`,
            animationDelay: `${particle.delay}ms`,
            '--startX': `${particle.startX}px`,
            '--startY': `${particle.startY}px`,
            '--endX': `${particle.endX}px`,
            '--endY': `${particle.endY}px`,
            '--rotation': `${particle.rotation}deg`,
            opacity: 0,
            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))',
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

// Coin/money particles - now with more bling
export const CoinParticles = ({ active, count = 10 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const emojis = ['✨', '💰', '⭐', '🌟', '💫', '🪙'];
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: `coin-${Date.now()}-${i}`,
        angle: (360 / count) * i + Math.random() * 30,
        distance: 70 + Math.random() * 50,
        delay: Math.random() * 200,
        duration: 1000 + Math.random() * 500,
        size: 16 + Math.random() * 8,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 1800);
      return () => clearTimeout(timer);
    }
  }, [active, count]);

  if (!particles.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const x = Math.cos(radians) * particle.distance;
        const y = Math.sin(radians) * particle.distance;

        return (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2"
            style={{
              fontSize: particle.size,
              animation: `coinBurst ${particle.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              animationDelay: `${particle.delay}ms`,
              '--tx': `${x}px`,
              '--ty': `${y}px`,
              opacity: 0,
              filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.9)) drop-shadow(0 0 20px rgba(250, 204, 21, 0.5))',
            }}
          >
            {particle.emoji}
          </div>
        );
      })}
    </div>
  );
};

// New: Firework burst effect for major milestones
export const FireworkParticles = ({ active, color = '#f59e0b' }) => {
  const [particles, setParticles] = useState([]);
  const [trails, setTrails] = useState([]);

  useEffect(() => {
    if (active) {
      // Central flash
      const centralFlash = {
        id: 'flash',
        type: 'flash',
      };

      // Outer ring of sparks
      const sparks = Array.from({ length: 24 }, (_, i) => ({
        id: `spark-${i}`,
        angle: (360 / 24) * i,
        distance: 100 + Math.random() * 30,
        size: 5 + Math.random() * 4,
        delay: 50 + Math.random() * 100,
        duration: 800 + Math.random() * 400,
        type: 'spark',
      }));

      // Trailing particles
      const trailParticles = Array.from({ length: 16 }, (_, i) => ({
        id: `trail-${i}`,
        angle: (360 / 16) * i + Math.random() * 15,
        distance: 60 + Math.random() * 20,
        size: 3 + Math.random() * 2,
        delay: 100 + Math.random() * 150,
        duration: 600 + Math.random() * 300,
        type: 'trail',
      }));

      setParticles([centralFlash, ...sparks]);
      setTrails(trailParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        setTrails([]);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {/* Central flash */}
      {particles.filter(p => p.type === 'flash').map(p => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 60,
            height: 60,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            animation: 'flashBurst 400ms ease-out forwards',
          }}
        />
      ))}

      {/* Spark particles */}
      {particles.filter(p => p.type === 'spark').map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const x = Math.cos(radians) * particle.distance;
        const y = Math.sin(radians) * particle.distance;

        return (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              backgroundColor: color,
              boxShadow: `0 0 ${particle.size * 4}px ${color}, 0 0 ${particle.size * 8}px ${color}`,
              animation: `particleBurst ${particle.duration}ms ease-out forwards`,
              animationDelay: `${particle.delay}ms`,
              '--tx': `${x}px`,
              '--ty': `${y}px`,
            }}
          />
        );
      })}

      {/* Trail particles */}
      {trails.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const x = Math.cos(radians) * particle.distance;
        const y = Math.sin(radians) * particle.distance;

        return (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              backgroundColor: '#fff',
              boxShadow: `0 0 ${particle.size * 2}px #fff`,
              animation: `particleBurst ${particle.duration}ms ease-out forwards`,
              animationDelay: `${particle.delay}ms`,
              '--tx': `${x}px`,
              '--ty': `${y}px`,
            }}
          />
        );
      })}
    </div>
  );
};

// New: Confetti celebration burst
export const ConfettiParticles = ({ active, count = 30 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
      const shapes = ['square', 'circle', 'triangle'];

      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: `confetti-${Date.now()}-${i}`,
        x: Math.random() * 200 - 100,
        y: -(50 + Math.random() * 80),
        endY: 80 + Math.random() * 60,
        rotation: Math.random() * 720,
        delay: Math.random() * 400,
        duration: 1200 + Math.random() * 600,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        wobble: Math.random() * 40 - 20,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 2200);
      return () => clearTimeout(timer);
    }
  }, [active, count]);

  if (!particles.length) return null;

  const renderShape = (particle) => {
    switch (particle.shape) {
      case 'triangle':
        return (
          <svg viewBox="0 0 10 10" style={{ width: particle.size, height: particle.size }}>
            <polygon points="5,0 10,10 0,10" fill={particle.color} />
          </svg>
        );
      case 'circle':
        return (
          <div
            className="rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
          />
        );
      default:
        return (
          <div
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
          />
        );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute left-1/2 top-1/2"
          style={{
            animation: `confettiFall ${particle.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            animationDelay: `${particle.delay}ms`,
            '--startX': `${particle.x}px`,
            '--startY': `${particle.y}px`,
            '--endX': `${particle.x + particle.wobble}px`,
            '--endY': `${particle.endY}px`,
            '--rotation': `${particle.rotation}deg`,
            opacity: 0,
          }}
        >
          {renderShape(particle)}
        </div>
      ))}
    </div>
  );
};

export default Particles;
