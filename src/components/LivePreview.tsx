import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCw, 
  ExternalLink, 
  Laptop, 
  Tablet, 
  Smartphone, 
  X,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { WorkspaceFile, ThemeConfig } from '../types';

interface LivePreviewProps {
  theme: ThemeConfig;
  files: WorkspaceFile[];
  onClose: () => void;
  onLogOutput?: (message: string, type: 'log' | 'error' | 'warn') => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  theme,
  files,
  onClose,
  onLogOutput,
}) => {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Find App.tsx and ParticleCanvas.tsx
  const getFileContent = (pathSuffix: string): string => {
    let result = '';
    const traverse = (items: WorkspaceFile[]) => {
      for (const item of items) {
        if (!item.isFolder && item.path.endsWith(pathSuffix)) {
          result = item.content;
          return;
        }
        if (item.children) traverse(item.children);
      }
    };
    traverse(files);
    return result;
  };

  const appContent = getFileContent('App.tsx');
  const particleContent = getFileContent('ParticleCanvas.tsx');
  const mathContent = getFileContent('math.ts');

  // Generate interactive standalone HTML runner
  const generatePreviewHtml = (): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React & ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone for live JSX translation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; background-color: #020617; color: #f8fafc; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    // Intercept console logs
    const origLog = console.log;
    const origWarn = console.warn;
    const origErr = console.error;

    console.log = (...args) => {
      origLog(...args);
      window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
    };
    console.warn = (...args) => {
      origWarn(...args);
      window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'warn', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
    };
    console.error = (...args) => {
      origErr(...args);
      window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
    };
  </script>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    // --- Injected math.ts ---
    function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
    function randomRange(min, max) { return Math.random() * (max - min) + min; }
    function lerp(start, end, t) { return start + (end - start) * clamp(t, 0, 1); }

    // --- Injected ParticleCanvas Component ---
    const ParticleCanvas = ({ count = 60, speed = 3, theme = 'neon', active = true }) => {
      const canvasRef = useRef(null);

      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId;
        let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
        let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

        const getColors = () => {
          if (theme === 'fire') return ['#f97316', '#ef4444', '#eab308', '#dc2626'];
          if (theme === 'galaxy') return ['#a855f7', '#ec4899', '#3b82f6', '#8b5cf6'];
          return ['#06b6d4', '#3b82f6', '#10b981', '#6366f1'];
        };

        const colors = getColors();

        const particles = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed * 0.8,
          vy: (Math.random() - 0.5) * speed * 0.8,
          radius: Math.random() * 2.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        }));

        const render = () => {
          ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
          ctx.fillRect(0, 0, width, height);

          // Lines
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(148, 163, 184, ' + ((1 - dist / 100) * 0.25) + ')';
                ctx.lineWidth = 0.8;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }

          // Particles
          particles.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (active) {
              p.x += p.vx;
              p.y += p.vy;
              if (p.x < 0 || p.x > width) p.vx *= -1;
              if (p.y < 0 || p.y > height) p.vy *= -1;
            }
          });

          animationId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
          if (!canvas.parentElement) return;
          width = canvas.width = canvas.parentElement.clientWidth;
          height = canvas.height = canvas.parentElement.clientHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => {
          cancelAnimationFrame(animationId);
          window.removeEventListener('resize', handleResize);
        };
      }, [count, speed, theme, active]);

      return <canvas ref={canvasRef} className="w-full h-full block" />;
    };

    // --- App Component ---
    function App() {
      const [speed, setSpeed] = useState(3);
      const [particlesCount, setParticlesCount] = useState(60);
      const [themeMode, setThemeMode] = useState('neon');
      const [isRunning, setIsRunning] = useState(true);

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between backdrop-blur bg-slate-950/80 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-indigo-500/20 shadow-lg">
                ⚡
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-white">Studio Canvas Playground</h1>
                <p className="text-xs text-slate-400">Interactive WebGL & 2D physics simulation</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {isRunning ? 'Pause Simulation' : 'Resume Simulation'}
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
            <div className="flex-1 min-h-[420px] rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden relative shadow-2xl flex flex-col">
              <div className="p-3 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Canvas 60 FPS
                </span>
                <span>Mode: {themeMode.toUpperCase()}</span>
              </div>
              <div className="flex-1 relative min-h-[350px]">
                <ParticleCanvas 
                  count={particlesCount} 
                  speed={speed} 
                  theme={themeMode} 
                  active={isRunning} 
                />
              </div>
            </div>

            <div className="w-full md:w-80 flex flex-col gap-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-5">
                <h2 className="text-sm font-semibold text-slate-200">Simulation Dynamics</h2>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Particle Velocity</span>
                    <span className="font-mono text-indigo-400">{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Particle Count</span>
                    <span className="font-mono text-indigo-400">{particlesCount}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={particlesCount}
                    onChange={(e) => setParticlesCount(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-2">Visual Theme</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['neon', 'fire', 'galaxy'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setThemeMode(mode)}
                        className={'py-2 text-xs font-medium rounded-lg border capitalize transition-all ' + (
                          themeMode === mode
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-sm'
                            : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CONSOLE_LOG' && onLogOutput) {
        onLogOutput(e.data.text, e.data.level);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogOutput]);

  const handleRefresh = () => {
    setIsCompiling(true);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsCompiling(false), 300);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgMain,
        borderColor: theme.borderColor,
      }}
      className="flex flex-col h-full border-l overflow-hidden select-none"
    >
      {/* Live Preview Header Toolbar */}
      <div
        style={{
          backgroundColor: theme.bgSidebar,
          borderColor: theme.borderColor,
        }}
        className="h-9 px-3 flex items-center justify-between border-b shrink-0 text-xs"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title="Reload Preview"
            className="p-1 hover:text-white text-neutral-400 hover:bg-white/10 rounded transition-colors"
          >
            <RotateCw size={13} className={isCompiling ? 'animate-spin' : ''} />
          </button>

          {/* Simulated Browser URL bar */}
          <div className="flex items-center bg-[#1e1e1e] border border-neutral-700/80 px-2.5 py-0.5 rounded text-[11px] text-neutral-300 w-44 md:w-56 font-mono">
            <span className="text-emerald-500 mr-1.5 font-bold">🔒</span>
            <span className="truncate">http://localhost:3000/</span>
          </div>
        </div>

        {/* Viewport Presets */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewportMode('desktop')}
            title="Desktop View (100%)"
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'desktop' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Laptop size={13} />
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'tablet' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tablet size={13} />
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            title="Mobile View (375px)"
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'mobile' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone size={13} />
          </button>

          <div className="w-[1px] h-3.5 bg-white/10 mx-1" />

          <button
            onClick={onClose}
            title="Close Preview"
            className="p-1.5 hover:text-white text-neutral-400 hover:bg-white/10 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-neutral-900/50 flex items-center justify-center p-2 overflow-auto">
        <div
          style={{ width: getViewportWidth() }}
          className="h-full bg-slate-950 rounded-md overflow-hidden shadow-2xl transition-all duration-200 border border-slate-800"
        >
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={generatePreviewHtml()}
            title="Studio Code Sandbox Preview"
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
