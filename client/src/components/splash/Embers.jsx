import React, { useMemo } from 'react';

export default function Embers({ count = 18 }) {
  const embers = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 2 + Math.random() * 4;
      const duration = 4 + Math.random() * 6;
      const delay = Math.random() * 5;
      const opacity = 0.15 + Math.random() * 0.45;
      return { id: i, left, size, duration, delay, opacity };
    });
  }, [count]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {embers.map((e) => (
        <span
          key={e.id}
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            borderRadius: '50%',
            backgroundColor: '#ffb95c',
            boxShadow: '0 0 8px rgba(245, 167, 66, 0.8)',
            opacity: e.opacity,
            animation: `ember-float ${e.duration}s ease-in-out ${e.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ember-float {
          0% {
            transform: translateY(0) scale(0.8) translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-105vh) scale(1.4) translateX(25px);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden="true"] { display: none; }
        }
      `}</style>
    </div>
  );
}
