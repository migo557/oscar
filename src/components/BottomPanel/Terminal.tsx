import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Plus, Trash2, Split, Check } from 'lucide-react';
import { WorkspaceFile, ThemeConfig } from '../../types';

interface TerminalProps {
  theme: ThemeConfig;
  files: WorkspaceFile[];
  onCreateFile: (name: string) => void;
  onStartLivePreview: () => void;
}

interface CommandLog {
  id: string;
  command: string;
  output: React.ReactNode;
}

export const Terminal: React.FC<TerminalProps> = ({
  theme,
  files,
  onCreateFile,
  onStartLivePreview,
}) => {
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'welcome',
      command: '',
      output: (
        <div className="text-neutral-400 space-y-1">
          <div>Studio Code Integrated Shell (bash v5.2)</div>
          <div>Type <span className="text-indigo-400 font-bold">help</span> to view available terminal commands.</div>
        </div>
      ),
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Execute terminal commands
  const handleRunCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      setLogs((prev) => [
        ...prev,
        { id: Date.now().toString(), command: '', output: null },
      ]);
      return;
    }

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputNode: React.ReactNode = null;

    switch (command) {
      case 'help':
        outputNode = (
          <div className="text-neutral-300 space-y-1">
            <div className="font-semibold text-white">Available Shell Commands:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 text-xs">
              <div><span className="text-indigo-400 font-mono">ls / dir</span> - list files</div>
              <div><span className="text-indigo-400 font-mono">pwd</span> - current directory</div>
              <div><span className="text-indigo-400 font-mono">cat &lt;file&gt;</span> - show content</div>
              <div><span className="text-indigo-400 font-mono">touch &lt;file&gt;</span> - create file</div>
              <div><span className="text-indigo-400 font-mono">node &lt;file&gt;</span> - run script</div>
              <div><span className="text-indigo-400 font-mono">npm run dev</span> - start preview</div>
              <div><span className="text-indigo-400 font-mono">npm run build</span> - compile app</div>
              <div><span className="text-indigo-400 font-mono">npm test</span> - run test runner</div>
              <div><span className="text-indigo-400 font-mono">git status</span> - show git status</div>
              <div><span className="text-indigo-400 font-mono">echo &lt;str&gt;</span> - print text</div>
              <div><span className="text-indigo-400 font-mono">clear</span> - clear console</div>
            </div>
          </div>
        );
        break;

      case 'clear':
        setLogs([]);
        setCurrentInput('');
        return;

      case 'pwd':
        outputNode = <div className="text-neutral-300">/home/studio-code/workspace</div>;
        break;

      case 'ls':
      case 'dir':
        outputNode = (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-xs py-1">
            {files.map((f) => (
              <span
                key={f.id}
                className={f.isFolder ? 'text-blue-400 font-bold' : 'text-neutral-200'}
              >
                {f.name}{f.isFolder ? '/' : ''}
              </span>
            ))}
          </div>
        );
        break;

      case 'cat':
        if (!args[0]) {
          outputNode = <div className="text-red-400">cat: missing file operand</div>;
        } else {
          const targetName = args[0];
          const found = files.find((f) => f.name.toLowerCase() === targetName.toLowerCase());
          if (found && !found.isFolder) {
            outputNode = (
              <pre className="text-neutral-300 whitespace-pre-wrap font-mono text-[11px] max-h-48 overflow-y-auto">
                {found.content}
              </pre>
            );
          } else {
            outputNode = <div className="text-red-400">cat: {targetName}: No such file or directory</div>;
          }
        }
        break;

      case 'touch':
        if (!args[0]) {
          outputNode = <div className="text-red-400">touch: missing file operand</div>;
        } else {
          onCreateFile(args[0]);
          outputNode = <div className="text-emerald-400">Created file {args[0]} in workspace.</div>;
        }
        break;

      case 'npm':
        if (args[0] === 'run' && (args[1] === 'dev' || args[1] === 'start')) {
          onStartLivePreview();
          outputNode = (
            <div className="space-y-1 text-xs">
              <div className="text-emerald-400 font-semibold">
                &gt; vite --port=3000 --host=0.0.0.0
              </div>
              <div className="text-neutral-300">
                VITE v8.3.0 ready in 184 ms
              </div>
              <div className="text-indigo-400">
                ➜ Local:   <span className="underline">http://localhost:3000/</span>
              </div>
              <div className="text-neutral-400">
                ➜ Network: use --host to expose
              </div>
            </div>
          );
        } else if (args[0] === 'run' && args[1] === 'build') {
          outputNode = (
            <div className="space-y-1 text-xs">
              <div className="text-neutral-300">&gt; tsc &amp;&amp; vite build</div>
              <div className="text-neutral-400">vite v8.3.0 building for production...</div>
              <div className="text-emerald-400">✓ 42 modules transformed.</div>
              <div className="text-neutral-300 font-mono text-[11px]">
                dist/index.html                   0.54 kB<br />
                dist/assets/index-D7b3x.js       84.12 kB │ gzip: 26.40 kB<br />
                dist/assets/index-C8v1y.css       4.90 kB │ gzip:  1.62 kB
              </div>
              <div className="text-emerald-400 font-medium">✓ built in 420ms</div>
            </div>
          );
        } else if (args[0] === 'test') {
          outputNode = (
            <div className="space-y-1 text-xs">
              <div className="text-neutral-300 font-mono">RUN  v2.1.8 /workspace</div>
              <div className="text-emerald-400">✓ src/utils/math.test.ts (3 tests)</div>
              <div className="text-neutral-400 pl-4 text-[11px]">
                ✓ clamps numbers within min and max (2ms)<br />
                ✓ generates random range within bounds (1ms)<br />
                ✓ interpolates linearly with lerp (1ms)
              </div>
              <div className="text-emerald-400 font-bold pt-1">
                Test Files  1 passed (1) │ Tests  3 passed (3)
              </div>
            </div>
          );
        } else {
          outputNode = <div className="text-neutral-400">npm version 10.9.0. Run 'npm run dev' or 'npm test'.</div>;
        }
        break;

      case 'node':
        if (!args[0]) {
          outputNode = <div className="text-neutral-300">Welcome to Node.js v22.14.0. Type '.exit' to leave.</div>;
        } else {
          outputNode = (
            <div className="text-emerald-400 font-mono">
              [Node Executed]: {args[0]} executed successfully with exit code 0.
            </div>
          );
        }
        break;

      case 'git':
        if (args[0] === 'status') {
          outputNode = (
            <div className="space-y-1 text-xs">
              <div className="text-neutral-300">On branch <span className="text-indigo-400 font-bold">main</span></div>
              <div className="text-neutral-400">Your branch is up to date with 'origin/main'.</div>
              <div className="text-neutral-300 pt-1">Changes not staged for commit:</div>
              <div className="text-red-400 pl-4 font-mono">modified:   src/App.tsx</div>
              <div className="text-neutral-500 text-[11px]">use "git add &lt;file&gt;..." to update what will be committed</div>
            </div>
          );
        } else {
          outputNode = <div className="text-neutral-300">git command '{args.join(' ')}' completed.</div>;
        }
        break;

      case 'echo':
        outputNode = <div className="text-neutral-300">{args.join(' ')}</div>;
        break;

      default:
        outputNode = (
          <div className="text-red-400">
            bash: {command}: command not found. Type 'help' for available commands.
          </div>
        );
    }

    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        command: trimmed,
        output: outputNode,
      },
    ]);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setCurrentInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setCurrentInput('');
        } else {
          setHistoryIdx(nextIdx);
          setCurrentInput(history[nextIdx]);
        }
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{ backgroundColor: theme.bgMain }}
      className="flex-1 flex flex-col h-full font-mono text-xs p-3 overflow-hidden select-text cursor-text"
    >
      <div className="flex-1 overflow-y-auto space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="space-y-1">
            {log.command && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">studio-code@web-ide</span>
                <span className="text-neutral-500">:</span>
                <span className="text-indigo-400">~/workspace</span>
                <span className="text-neutral-400">$</span>
                <span className="text-white">{log.command}</span>
              </div>
            )}
            {log.output && <div className="pl-0">{log.output}</div>}
          </div>
        ))}

        {/* Current Prompt */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-semibold shrink-0">studio-code@web-ide</span>
          <span className="text-neutral-500 shrink-0">:</span>
          <span className="text-indigo-400 shrink-0">~/workspace</span>
          <span className="text-neutral-400 shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-white outline-none border-none p-0 font-mono text-xs caret-white"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
