export default function AnimatedBackground() {
  // Formatted code snippets rendered along the left and right walls of the 3D corridor
  const codeBlocks = [
    // Left wall
    { code: "async function fetch() {\n  const res = await api.get('/data');\n  return res.json();\n}", top: '2%', delay: '-5s', duration: '35s', depth: 'far', dir: 'left' },
    { code: "try {\n  initSystem();\n  console.log('Online');\n} catch(e) {\n  reportError(e);\n}", top: '25%', delay: '-20s', duration: '45s', depth: 'mid', dir: 'left' },
    { code: "if (status === 200) {\n  renderUI(data);\n  state.sync();\n}", top: '55%', delay: '-2s', duration: '28s', depth: 'near', dir: 'left' },
    { code: "module.exports = {\n  plugins: [react()],\n  build: { outDir: 'dist' }\n};", top: '75%', delay: '-12s', duration: '38s', depth: 'far', dir: 'left' },
    { code: "SELECT * FROM users\nWHERE active = 1\nORDER BY created_at DESC;", top: '85%', delay: '-35s', duration: '42s', depth: 'mid', dir: 'left' },
    { code: "function sort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[0];\n  return [...left, pivot, ...right];\n}", top: '12%', delay: '-28s', duration: '33s', depth: 'near', dir: 'left' },
    { code: "import { useState } from 'react';\n\nconst [count, setCount] = useState(0);", top: '42%', delay: '-40s', duration: '50s', depth: 'far', dir: 'left' },

    // Right wall
    { code: "const assistant = new MemoryAssistant({\n  memory: 'vector',\n  db: 'ChromaDB'\n});", top: '8%', delay: '-15s', duration: '40s', depth: 'mid', dir: 'right' },
    { code: "def analyze_data(df):\n  return df.groupby('date').sum()", top: '30%', delay: '-30s', duration: '32s', depth: 'far', dir: 'right' },
    { code: "export const config = {\n  theme: 'dark',\n  accents: ['#ff6a1a']\n};", top: '65%', delay: '-10s', duration: '38s', depth: 'near', dir: 'right' },
    { code: "<div className=\"flex flex-col\">\n  <header>App</header>\n  <main>{children}</main>\n</div>", top: '82%', delay: '-22s', duration: '34s', depth: 'mid', dir: 'right' },
    { code: "interface User {\n  id: number;\n  name: string;\n  email: string;\n}", top: '18%', delay: '-5s', duration: '46s', depth: 'far', dir: 'right' },
    { code: "git commit -m 'feat: Add 3D code corridor'\ngit push origin main", top: '48%', delay: '-45s', duration: '29s', depth: 'near', dir: 'right' },
    { code: "class Camera {\n  constructor(fov, aspect) {\n    this.fov = fov;\n    this.aspect = aspect;\n  }\n}", top: '88%', delay: '-33s', duration: '41s', depth: 'far', dir: 'right' }
  ];

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-bg motion-reduce:hidden">
      {/* Central light glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(circle,rgba(255,106,26,0.06)_0%,transparent_70%)] blur-3xl rounded-full"></div>
      
      {/* 3D corridor container (perspective) */}
      <div className="absolute inset-0" style={{ perspective: '1000px' }}>
        {codeBlocks.map((block, i) => {
          // Camera depth (blur, opacity, scale)
          const isFar = block.depth === 'far';
          const isNear = block.depth === 'near';
          const opacity = isFar ? 'opacity-10' : isNear ? 'opacity-30' : 'opacity-20';
          const blur = isFar ? 'blur-[3px]' : isNear ? 'blur-[0px]' : 'blur-[1px]';
          const scale = isFar ? 'scale-75' : isNear ? 'scale-110' : 'scale-90';
          
          // Tunnel walls animation
          const animationClass = block.dir === 'right' ? 'animate-corridor-right' : 'animate-corridor-left';
          const rotate = block.dir === 'right' ? 'rotateY(30deg)' : 'rotateY(-30deg)';

          return (
            <div
              key={i}
              className={`absolute w-full ${animationClass}`}
              style={{
                top: block.top,
                animationDuration: block.duration,
                animationDelay: block.delay, // Staggered start so the screen is already populated
              }}
            >
              <pre
                className={`inline-block font-mono text-accent font-bold text-sm sm:text-base leading-relaxed ${opacity} ${blur}`}
                style={{
                  textShadow: '0 0 12px rgba(255,106,26,0.8)', // Intense neon glow
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
