import React, { useState } from 'react';
import { 
  Terminal as TerminalIcon, 
  AlertCircle, 
  FileText, 
  Bug, 
  Maximize2, 
  Minimize2, 
  X, 
  Plus,
  Trash2
} from 'lucide-react';
import { BottomTab, WorkspaceFile, ThemeConfig, ProblemItem } from '../../types';
import { Terminal } from './Terminal';
import { ProblemsView } from './ProblemsView';
import { OutputView } from './OutputView';
import { DebugConsole } from './DebugConsole';

interface BottomPanelProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  files: WorkspaceFile[];
  problems: ProblemItem[];
  outputLogs: { time: string; text: string; channel: string }[];
  onClearOutput: () => void;
  onCreateFile: (name: string) => void;
  onStartLivePreview: () => void;
  onSelectProblem: (fileId: string, line: number) => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  theme,
  isOpen,
  onClose,
  files,
  problems,
  outputLogs,
  onClearOutput,
  onCreateFile,
  onStartLivePreview,
  onSelectProblem,
}) => {
  const [activeTab, setActiveTab] = useState<BottomTab>('terminal');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const tabs: { id: BottomTab; label: string; badge?: number }[] = [
    { id: 'problems', label: 'Problems', badge: problems.length > 0 ? problems.length : undefined },
    { id: 'output', label: 'Output' },
    { id: 'debugConsole', label: 'Debug Console' },
    { id: 'terminal', label: 'Terminal' },
  ];

  return (
    <div
      style={{
        backgroundColor: theme.bgMain,
        borderColor: theme.borderColor,
        height: isMaximized ? '75vh' : '230px',
      }}
      className="flex flex-col border-t select-none transition-all duration-150 z-20 shrink-0"
    >
      {/* Header Tabs Bar */}
      <div
        style={{
          backgroundColor: theme.bgSidebar,
          borderColor: theme.borderColor,
        }}
        className="h-8 px-3 flex items-center justify-between border-b shrink-0 text-xs"
      >
        {/* Left Tabs */}
        <div className="flex items-center gap-1 h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  borderBottom: isActive ? `2px solid ${theme.accent}` : '2px solid transparent',
                  color: isActive ? '#ffffff' : theme.textSecondary,
                }}
                className={`h-full px-3 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors ${
                  isActive ? 'text-white' : 'hover:text-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="min-w-[15px] h-[15px] px-1 rounded-full bg-red-600 text-white text-[10px] font-mono flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Window Controls */}
        <div className="flex items-center gap-1 text-neutral-400">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore Panel Size' : 'Maximize Panel Size'}
            className="p-1 hover:text-white hover:bg-white/10 rounded"
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={onClose}
            title="Close Panel (Ctrl+`)"
            className="p-1 hover:text-white hover:bg-white/10 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'terminal' && (
          <Terminal
            theme={theme}
            files={files}
            onCreateFile={onCreateFile}
            onStartLivePreview={onStartLivePreview}
          />
        )}
        {activeTab === 'problems' && (
          <ProblemsView
            theme={theme}
            problems={problems}
            onSelectProblem={onSelectProblem}
          />
        )}
        {activeTab === 'output' && (
          <OutputView
            theme={theme}
            logs={outputLogs}
            onClear={onClearOutput}
          />
        )}
        {activeTab === 'debugConsole' && (
          <DebugConsole theme={theme} />
        )}
      </div>
    </div>
  );
};
