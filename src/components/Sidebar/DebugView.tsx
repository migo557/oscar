import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Square, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2,
  Bug
} from 'lucide-react';
import { ThemeConfig } from '../../types';

interface DebugViewProps {
  theme: ThemeConfig;
  breakpoints: { file: string; line: number; active: boolean }[];
  onToggleBreakpoint: (file: string, line: number) => void;
  onClearBreakpoints: () => void;
  onStartDebugging: () => void;
  isDebugging: boolean;
}

export const DebugView: React.FC<DebugViewProps> = ({
  theme,
  breakpoints,
  onToggleBreakpoint,
  onClearBreakpoints,
  onStartDebugging,
  isDebugging,
}) => {
  const [selectedConfig, setSelectedConfig] = useState('Launch App Preview (Port 3000)');
  const [isVariablesOpen, setIsVariablesOpen] = useState(true);
  const [isWatchOpen, setIsWatchOpen] = useState(true);
  const [isBreakpointsOpen, setIsBreakpointsOpen] = useState(true);
  
  const [watchExpressions, setWatchExpressions] = useState<string[]>([
    'window.location.href',
    'document.title',
    'particles.length',
  ]);
  const [newExpression, setNewExpression] = useState('');
  const [isAddingWatch, setIsAddingWatch] = useState(false);

  const handleAddWatch = () => {
    if (newExpression.trim()) {
      setWatchExpressions((prev) => [...prev, newExpression.trim()]);
      setNewExpression('');
      setIsAddingWatch(false);
    }
  };

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="h-8 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide text-neutral-300 uppercase border-b border-white/5 shrink-0">
        <span>Run and Debug</span>
      </div>

      {/* Target Selector & Controls */}
      <div className="p-3 border-b border-white/5 space-y-2">
        <select
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(e.target.value)}
          className="w-full bg-[#1e1e1e] border border-neutral-700 text-xs text-white p-1.5 outline-none rounded-sm"
        >
          <option>Launch App Preview (Port 3000)</option>
          <option>Run Node.js Current Script</option>
          <option>Test Runner (Vitest / Jest)</option>
        </select>

        {/* Debug Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onStartDebugging}
            className={`flex-1 h-7 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              isDebugging
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isDebugging ? <Pause size={13} /> : <Play size={13} className="fill-white" />}
            <span>{isDebugging ? 'Pause' : 'Start Debugging'}</span>
          </button>

          {isDebugging && (
            <button
              onClick={onStartDebugging}
              title="Stop Debugging"
              className="h-7 px-3 bg-red-600/80 hover:bg-red-600 text-white rounded flex items-center justify-center"
            >
              <Square size={12} className="fill-white" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Variables Section */}
        <div className="border-b border-white/5">
          <button
            onClick={() => setIsVariablesOpen(!isVariablesOpen)}
            className="w-full h-6 px-3 flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-white uppercase"
          >
            {isVariablesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Variables</span>
          </button>

          {isVariablesOpen && (
            <div className="pl-6 pr-3 py-1 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[#9cdcfe]">speed:</span>
                <span className="text-[#b5cea8]">3</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[#9cdcfe]">particlesCount:</span>
                <span className="text-[#b5cea8]">60</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[#9cdcfe]">themeMode:</span>
                <span className="text-[#ce9178]">"neon"</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[#9cdcfe]">isRunning:</span>
                <span className="text-[#569cd6]">true</span>
              </div>
            </div>
          )}
        </div>

        {/* Watch Expressions */}
        <div className="border-b border-white/5">
          <div className="h-6 px-3 flex items-center justify-between text-[11px] font-semibold text-neutral-400 group">
            <button
              onClick={() => setIsWatchOpen(!isWatchOpen)}
              className="flex items-center gap-1 hover:text-white uppercase"
            >
              {isWatchOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Watch</span>
            </button>
            <button
              onClick={() => setIsAddingWatch(true)}
              title="Add Expression"
              className="hover:text-white p-0.5"
            >
              <Plus size={13} />
            </button>
          </div>

          {isWatchOpen && (
            <div className="pl-6 pr-3 py-1 space-y-1 text-[11px]">
              {isAddingWatch && (
                <div className="flex items-center gap-1 mb-1">
                  <input
                    type="text"
                    autoFocus
                    value={newExpression}
                    onChange={(e) => setNewExpression(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddWatch();
                      if (e.key === 'Escape') setIsAddingWatch(false);
                    }}
                    onBlur={handleAddWatch}
                    placeholder="Expression to watch"
                    className="w-full bg-[#1e1e1e] border border-[#007acc] text-xs text-white px-1 py-0.5 outline-none font-mono"
                  />
                </div>
              )}

              {watchExpressions.map((expr, idx) => (
                <div key={idx} className="flex items-center justify-between font-mono text-neutral-400 group">
                  <span className="truncate">{expr}:</span>
                  <span className="text-[#4ec9b0] ml-2 shrink-0">defined</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakpoints */}
        <div className="border-b border-white/5">
          <div className="h-6 px-3 flex items-center justify-between text-[11px] font-semibold text-neutral-400 group">
            <button
              onClick={() => setIsBreakpointsOpen(!isBreakpointsOpen)}
              className="flex items-center gap-1 hover:text-white uppercase"
            >
              {isBreakpointsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Breakpoints</span>
              <span className="font-mono text-neutral-500">({breakpoints.length})</span>
            </button>

            {breakpoints.length > 0 && (
              <button
                onClick={onClearBreakpoints}
                title="Remove All Breakpoints"
                className="hover:text-white p-0.5 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {isBreakpointsOpen && (
            <div className="pb-1">
              {breakpoints.length === 0 ? (
                <div className="px-6 py-2 text-neutral-500 text-[11px]">
                  Click to the left of line numbers in the editor to set a breakpoint.
                </div>
              ) : (
                breakpoints.map((bp, idx) => (
                  <div
                    key={idx}
                    onClick={() => onToggleBreakpoint(bp.file, bp.line)}
                    className="h-6 pl-6 pr-3 flex items-center gap-2 hover:bg-white/5 cursor-pointer text-xs text-neutral-300"
                  >
                    <input
                      type="checkbox"
                      checked={bp.active}
                      onChange={() => {}}
                      className="accent-[#e51400] w-3 h-3"
                    />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#e51400] shrink-0" />
                    <span className="truncate">{bp.file}</span>
                    <span className="font-mono text-neutral-500 ml-auto">:line {bp.line}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
