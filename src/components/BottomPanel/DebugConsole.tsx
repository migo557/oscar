import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface DebugConsoleProps {
  theme: ThemeConfig;
}

interface ReplEntry {
  id: string;
  input: string;
  output: string;
  isError?: boolean;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ theme }) => {
  const [entries, setEntries] = useState<ReplEntry[]>([
    {
      id: 'init',
      input: 'console.log("Studio Code Debug Console connected.")',
      output: 'undefined',
    },
  ]);
  const [replInput, setReplInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const handleEvaluate = () => {
    if (!replInput.trim()) return;

    let outputStr = '';
    let isErr = false;

    try {
      // Evaluate expression
      // eslint-disable-next-line no-eval
      const result = window.eval(replInput);
      if (typeof result === 'object' && result !== null) {
        outputStr = JSON.stringify(result, null, 2);
      } else {
        outputStr = String(result);
      }
    } catch (err: any) {
      outputStr = err?.message || 'Evaluation Error';
      isErr = true;
    }

    setEntries((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        input: replInput.trim(),
        output: outputStr,
        isError: isErr,
      },
    ]);
    setReplInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full font-mono text-xs overflow-hidden select-text">
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-0.5">
            <div className="flex items-center gap-1 text-neutral-400">
              <ChevronRight size={13} className="text-neutral-500" />
              <span className="text-neutral-300">{entry.input}</span>
            </div>
            <div
              className={`pl-4 whitespace-pre-wrap ${
                entry.isError ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {entry.output}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div 
        style={{ borderColor: theme.borderColor }}
        className="h-8 px-3 border-t flex items-center gap-2 shrink-0 bg-black/10"
      >
        <ChevronRight size={14} className="text-[#007acc] shrink-0" />
        <input
          type="text"
          value={replInput}
          onChange={(e) => setReplInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEvaluate();
          }}
          placeholder="Evaluate expression (e.g. 2 + 2, Math.random(), document.title)..."
          className="flex-1 bg-transparent text-white outline-none border-none text-xs font-mono caret-white"
        />
        <button
          onClick={() => setEntries([])}
          title="Clear Console"
          className="text-neutral-500 hover:text-white p-1"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
