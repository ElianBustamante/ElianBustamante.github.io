import React from 'react';

export default function AnimatedBackground() {
  // Configuración de los iconos geométricos
  const shapes = [
    { type: 'square', size: 40, left: '10%', delay: '0s', duration: '22s' },
    { type: 'circle', size: 65, left: '25%', delay: '4s', duration: '28s' },
    { type: 'square', size: 30, left: '45%', delay: '2s', duration: '18s' },
    { type: 'circle', size: 80, left: '65%', delay: '8s', duration: '35s' },
    { type: 'square', size: 45, left: '85%', delay: '1s', duration: '25s' },
    { type: 'circle', size: 25, left: '90%', delay: '12s', duration: '15s' },
    { type: 'square', size: 55, left: '5%', delay: '15s', duration: '30s' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Textura: Cuadrícula sutil de puntos para quitar el negro plano */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,106,26,0.08)_1px,transparent_1px)] [background-size:40px_40px] opacity-50"></div>
      
      {/* Formas flotantes (Gravedad cero) */}
      {shapes.map((s, i) => (
        <div
          key={i}
          className={`absolute border-[1.5px] border-accent/30 ${
            s.type === 'circle' ? 'rounded-full' : 'rounded-sm'
          } animate-float`}
          style={{
            width: s.size,
            height: s.size,
            left: s.left,
            bottom: '-100px', // Empiezan ocultas abajo
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
