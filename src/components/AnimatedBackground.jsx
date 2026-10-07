import React from 'react';

export default function AnimatedBackground() {
  // Símbolos clásicos de programación
  const symbols = [
    { text: '{ }', size: 'text-4xl', left: '10%', delay: '0s', duration: '22s' },
    { text: '< />', size: 'text-2xl', left: '25%', delay: '4s', duration: '28s' },
    { text: '0 1', size: 'text-3xl', left: '45%', delay: '2s', duration: '18s' },
    { text: '=>', size: 'text-5xl', left: '65%', delay: '8s', duration: '35s' },
    { text: '#', size: 'text-3xl', left: '85%', delay: '1s', duration: '25s' },
    { text: '[ ]', size: 'text-xl', left: '90%', delay: '12s', duration: '15s' },
    { text: '/>', size: 'text-4xl', left: '5%', delay: '15s', duration: '30s' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 font-mono">
      {/* Textura de matriz/plano técnico */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,106,26,0.08)_1px,transparent_1px)] [background-size:40px_40px] opacity-50"></div>
      
      {/* Símbolos flotantes */}
      {symbols.map((s, i) => (
        <div
          key={i}
          className={`absolute text-accent/30 font-bold select-none animate-float-code ${s.size}`}
          style={{
            left: s.left,
            bottom: '-100px',
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        >
          {s.text}
        </div>
      ))}
    </div>
  );
}
