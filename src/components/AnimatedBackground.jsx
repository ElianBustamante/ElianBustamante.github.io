import React from 'react';

export default function AnimatedBackground() {
  // Bloques de código reales formateados
  const codeBlocks = [
    { code: "async function fetch() {\n  const res = await api.get('/data');\n  return res.json();\n}", top: '5%', delay: '-5s', duration: '35s', depth: 'far', dir: 'left' },
    { code: "try {\n  initSystem();\n  console.log('Online');\n} catch(e) {\n  reportError(e);\n}", top: '35%', delay: '-20s', duration: '45s', depth: 'mid', dir: 'left' },
    { code: "if (status === 200) {\n  renderUI(data);\n  state.sync();\n}", top: '65%', delay: '-2s', duration: '28s', depth: 'near', dir: 'left' },
    { code: "const pipeline = new Pipeline3D({\n  resolution: '4K',\n  engine: 'WebGL2'\n});", top: '15%', delay: '-15s', duration: '40s', depth: 'mid', dir: 'right' },
    { code: "def analyze_data(df):\n  return df.groupby('date').sum()", top: '50%', delay: '-30s', duration: '32s', depth: 'far', dir: 'right' },
    { code: "export const config = {\n  theme: 'dark',\n  accents: ['#ff6a1a']\n};", top: '75%', delay: '-10s', duration: '38s', depth: 'near', dir: 'right' }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0a0a0a]">
      {/* Resplandor central de luz (Efecto del video) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(circle,rgba(255,106,26,0.06)_0%,transparent_70%)] blur-3xl rounded-full"></div>
      
      {/* Contenedor del Pasillo 3D (Perspectiva) */}
      <div className="absolute inset-0" style={{ perspective: '1000px' }}>
        {codeBlocks.map((block, i) => {
          // Profundidad de cámara (Desenfoque, Opacidad y Escala)
          const isFar = block.depth === 'far';
          const isNear = block.depth === 'near';
          const opacity = isFar ? 'opacity-10' : isNear ? 'opacity-30' : 'opacity-20';
          const blur = isFar ? 'blur-[3px]' : isNear ? 'blur-[0px]' : 'blur-[1px]';
          const scale = isFar ? 'scale-75' : isNear ? 'scale-110' : 'scale-90';
          
          // Animación de paredes del túnel
          const animationClass = block.dir === 'right' ? 'animate-corridor-right' : 'animate-corridor-left';
          const rotate = block.dir === 'right' ? 'rotateY(30deg)' : 'rotateY(-30deg)';

          return (
            <div
              key={i}
              className={`absolute w-full ${animationClass}`}
              style={{
                top: block.top,
                animationDuration: block.duration,
                animationDelay: block.delay, // Empiezan desfasados para que la pantalla ya esté llena
              }}
            >
              <pre
                className={`inline-block font-mono text-accent font-bold text-sm sm:text-base leading-relaxed ${opacity} ${blur}`}
                style={{
                  textShadow: '0 0 12px rgba(255,106,26,0.8)', // Brillo de neón intenso
                  transform: `${scale} ${rotate}`,
                  transformOrigin: block.dir === 'right' ? 'left center' : 'right center'
                }}
              >
                {block.code}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
