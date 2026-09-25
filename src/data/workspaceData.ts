import { WorkspaceFile, ExtensionItem, ThemeConfig } from '../types';

export const THEMES: Record<string, ThemeConfig> = {
  'vs-dark': {
    id: 'vs-dark',
    name: 'Dark+ (default dark)',
    type: 'dark',
    bgMain: '#1e1e1e',
    bgSidebar: '#252526',
    bgActivityBar: '#333333',
    bgTabActive: '#1e1e1e',
    bgTabInactive: '#2d2d2d',
    bgStatusBar: '#007acc',
    fgStatusBar: '#ffffff',
    textPrimary: '#cccccc',
    textSecondary: '#858585',
    borderColor: '#3c3c3c',
    selectionBg: 'rgba(38, 79, 120, 0.7)',
    lineHighlight: '#282828',
    accent: '#007acc',
  },
  'one-dark-pro': {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    type: 'dark',
    bgMain: '#282c34',
    bgSidebar: '#21252b',
    bgActivityBar: '#1e1e24',
    bgTabActive: '#282c34',
    bgTabInactive: '#21252b',
    bgStatusBar: '#21252b',
    fgStatusBar: '#9da5b4',
    textPrimary: '#abb2bf',
    textSecondary: '#5c6370',
    borderColor: '#181a1f',
    selectionBg: 'rgba(62, 68, 81, 0.8)',
    lineHighlight: '#2c313a',
    accent: '#61afef',
  },
  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark Default',
    type: 'dark',
    bgMain: '#0d1117',
    bgSidebar: '#161b22',
    bgActivityBar: '#010409',
    bgTabActive: '#0d1117',
    bgTabInactive: '#161b22',
    bgStatusBar: '#161b22',
    fgStatusBar: '#c9d1d9',
    textPrimary: '#c9d1d9',
    textSecondary: '#8b949e',
    borderColor: '#30363d',
    selectionBg: 'rgba(56, 139, 253, 0.25)',
    lineHighlight: '#161b22',
    accent: '#2f81f7',
  },
  'monokai': {
    id: 'monokai',
    name: 'Monokai Pro',
    type: 'dark',
    bgMain: '#272822',
    bgSidebar: '#1e1f1c',
    bgActivityBar: '#191917',
    bgTabActive: '#272822',
    bgTabInactive: '#1e1f1c',
    bgStatusBar: '#75715e',
    fgStatusBar: '#f8f8f2',
    textPrimary: '#f8f8f2',
    textSecondary: '#75715e',
    borderColor: '#3e3d32',
    selectionBg: '#49483e',
    lineHighlight: '#3e3d32',
    accent: '#fd971f',
  },
  'light-plus': {
    id: 'light-plus',
    name: 'Light+ (default light)',
    type: 'light',
    bgMain: '#ffffff',
    bgSidebar: '#f3f3f3',
    bgActivityBar: '#2c2c2c',
    bgTabActive: '#ffffff',
    bgTabInactive: '#ececec',
    bgStatusBar: '#007acc',
    fgStatusBar: '#ffffff',
    textPrimary: '#333333',
    textSecondary: '#707070',
    borderColor: '#e5e5e5',
    selectionBg: '#add6ff',
    lineHighlight: '#f7f7f7',
    accent: '#007acc',
  },
};

export const INITIAL_FILES: WorkspaceFile[] = [
  {
    id: 'root-src',
    name: 'src',
    path: 'src',
    content: '',
    initialContent: '',
    language: 'plaintext',
    isFolder: true,
    isOpen: true,
    children: [
      {
        id: 'src-app',
        name: 'App.tsx',
        path: 'src/App.tsx',
        language: 'tsx',
        isFolder: false,
        content: `import React, { useState, useEffect } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { clamp, randomRange } from './utils/math';

export default function App() {
  const [speed, setSpeed] = useState<number>(3);
  const [particlesCount, setParticlesCount] = useState<number>(60);
  const [themeMode, setThemeMode] = useState<'neon' | 'fire' | 'galaxy'>('neon');
  const [isRunning, setIsRunning] = useState<boolean>(true);

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
        {/* Simulation Canvas Viewport */}
        <div className="flex-1 min-h-[420px] rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden relative shadow-2xl flex flex-col">
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Canvas 60 FPS
            </span>
            <span>Mode: {themeMode.toUpperCase()}</span>
          </div>
          <div className="flex-1 relative">
            <ParticleCanvas 
              count={particlesCount} 
              speed={speed} 
              theme={themeMode} 
              active={isRunning} 
            />
          </div>
        </div>

        {/* Real-time Control Panel */}
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
                {(['neon', 'fire', 'galaxy'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setThemeMode(mode)}
                    className={\`py-2 text-xs font-medium rounded-lg border capitalize transition-all \${
                      themeMode === mode
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-sm'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }\`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 text-xs text-slate-400 space-y-2">
            <div className="font-medium text-slate-300">Quick Tips</div>
            <p>Edit this file in Studio Code and the Live Preview updates automatically.</p>
            <p>Try pressing <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">Ctrl+P</kbd> to jump between files.</p>
          </div>
        </div>
      </main>
    </div>
  );
}`,
        initialContent: '',
      },
      {
        id: 'src-components',
        name: 'components',
        path: 'src/components',
        language: 'plaintext',
        isFolder: true,
        isOpen: true,
        content: '',
        initialContent: '',
        children: [
          {
            id: 'src-components-particle',
            name: 'ParticleCanvas.tsx',
            path: 'src/components/ParticleCanvas.tsx',
            language: 'tsx',
            isFolder: false,
            content: `import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  count: number;
  speed: number;
  theme: 'neon' | 'fire' | 'galaxy';
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  count,
  speed,
  theme,
  active,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const getThemeColors = () => {
      if (theme === 'fire') return ['#f97316', '#ef4444', '#eab308', '#dc2626'];
      if (theme === 'galaxy') return ['#a855f7', '#ec4899', '#3b82f6', '#8b5cf6'];
      return ['#06b6d4', '#3b82f6', '#10b981', '#6366f1'];
    };

    const colors = getThemeColors();

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed * 0.8,
      vy: (Math.random() - 0.5) * speed * 0.8,
      radius: Math.random() * 2.5 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = \`rgba(148, 163, 184, \${(1 - dist / 100) * 0.25})\`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
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
`,
            initialContent: '',
          },
        ],
      },
      {
        id: 'src-utils',
        name: 'utils',
        path: 'src/utils',
        language: 'plaintext',
        isFolder: true,
        isOpen: true,
        content: '',
        initialContent: '',
        children: [
          {
            id: 'src-utils-math',
            name: 'math.ts',
            path: 'src/utils/math.ts',
            language: 'typescript',
            isFolder: false,
            content: `/**
 * Math utilities for numerical bounds and random distribution.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}
`,
            initialContent: '',
          },
        ],
      },
    ],
  },
  {
    id: 'file-package-json',
    name: 'package.json',
    path: 'package.json',
    language: 'json',
    isFolder: false,
    content: `{
  "name": "studio-canvas-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^8.3.0",
    "tailwindcss": "^4.3.0"
  }
}
`,
    initialContent: '',
  },
  {
    id: 'file-readme',
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    isFolder: false,
    content: `# Studio Code Workspace

Welcome to **Studio Code**, an in-browser cloud IDE designed with full Visual Studio Code ergonomics and lightning-fast developer tools.

## Features

- 📁 **File Explorer**: Create, rename, delete files and folders with hierarchical organization.
- ⚡ **Live Preview**: Sandboxed real-time application runtime in split or tab view.
- 💻 **Integrated Terminal**: Execute interactive shell commands (\`ls\`, \`cat\`, \`node\`, \`git\`, \`npm run\`).
- 🎨 **Theme Engine**: Switch between VS Code Dark+, One Dark Pro, GitHub Dark, Monokai, and Light+.
- 🔍 **Search & Replace**: Global multi-file search with regex and case-sensitive filters.
- 🌿 **Source Control**: Git status, staging, commit messages, and side-by-side Git Diff view.
- 🤖 **AI Studio Copilot**: Code explanation, bug finding, refactoring, and auto-completion.
- ⌨️ **Command Palette**: Press \`Ctrl+Shift+P\` or \`Ctrl+P\` to access instant commands.
`,
    initialContent: '',
  },
  {
    id: 'file-tsconfig',
    name: 'tsconfig.json',
    path: 'tsconfig.json',
    language: 'json',
    isFolder: false,
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
`,
    initialContent: '',
  },
  {
    id: 'file-gitignore',
    name: '.gitignore',
    path: '.gitignore',
    language: 'plaintext',
    isFolder: false,
    content: `node_modules
dist
.env
.DS_Store
*.log
`,
    initialContent: '',
  },
];

// Initialize initialContent
const initFiles = (files: WorkspaceFile[]): WorkspaceFile[] => {
  return files.map((f) => ({
    ...f,
    initialContent: f.content,
    children: f.children ? initFiles(f.children) : undefined,
  }));
};

export const DEFAULT_WORKSPACE_FILES = initFiles(INITIAL_FILES);

export const EXTENSIONS_CATALOG: ExtensionItem[] = [
  {
    id: 'prettier',
    name: 'Prettier - Code formatter',
    publisher: 'Prettier',
    description: 'Code formatter using prettier for JS, TS, HTML, CSS, JSON.',
    version: '10.4.0',
    downloads: '42.8M',
    rating: 4.8,
    installed: true,
    category: 'Formatters',
    iconBg: '#ea580c',
  },
  {
    id: 'eslint',
    name: 'ESLint',
    publisher: 'Microsoft',
    description: 'Integrates ESLint JavaScript and TypeScript into VS Code.',
    version: '3.0.5',
    downloads: '38.2M',
    rating: 4.6,
    installed: true,
    category: 'Linters',
    iconBg: '#4f46e5',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    publisher: 'GitHub',
    description: 'Your AI pair programmer that helps you write code faster and with less work.',
    version: '1.250.0',
    downloads: '21.5M',
    rating: 4.9,
    installed: true,
    category: 'AI',
    iconBg: '#0284c7',
  },
  {
    id: 'tailwind-intellisense',
    name: 'Tailwind CSS IntelliSense',
    publisher: 'Tailwind Labs',
    description: 'Intelligent Tailwind CSS tooling for VS Code.',
    version: '0.14.3',
    downloads: '18.1M',
    rating: 4.9,
    installed: true,
    category: 'Other',
    iconBg: '#06b6d4',
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    publisher: 'binaryify',
    description: "Atom's iconic One Dark theme, and one of the most installed themes for VS Code!",
    version: '3.19.8',
    downloads: '9.4M',
    rating: 4.9,
    installed: false,
    category: 'Themes',
    iconBg: '#8b5cf6',
  },
  {
    id: 'python',
    name: 'Python',
    publisher: 'Microsoft',
    description: 'Python language support with extension access to Pylance and debugger.',
    version: '2026.2.0',
    downloads: '112M',
    rating: 4.7,
    installed: false,
    category: 'Programming Languages',
    iconBg: '#3b82f6',
  },
  {
    id: 'gitlens',
    name: 'GitLens — Git supercharged',
    publisher: 'GitKraken',
    description: 'Supercharge Git within VS Code — Visualize code authorship, navigate revisions.',
    version: '15.6.0',
    downloads: '33.1M',
    rating: 4.7,
    installed: true,
    category: 'SCM Providers',
    iconBg: '#f43f5e',
  },
  {
    id: 'material-icon-theme',
    name: 'Material Icon Theme',
    publisher: 'Philipp Kief',
    description: 'Material Design Icons for Visual Studio Code.',
    version: '5.18.0',
    downloads: '26.8M',
    rating: 4.9,
    installed: true,
    category: 'Themes',
    iconBg: '#10b981',
  },
];
