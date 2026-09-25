import React from 'react';
import { 
  GitBranch, 
  RotateCw, 
  AlertCircle, 
  AlertTriangle, 
  Bell, 
  Check, 
  Radio
} from 'lucide-react';
import { ThemeConfig, FileLanguage } from '../types';

interface StatusBarProps {
  theme: ThemeConfig;
  cursorPos: { line: number; col: number };
  tabSize: number;
  language: FileLanguage;
  errorsCount: number;
  warningsCount: number;
  isLivePreviewActive: boolean;
  onOpenProblems: () => void;
  onOpenLanguageSelector: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  theme,
  cursorPos,
  tabSize,
  language,
  errorsCount,
  warningsCount,
  isLivePreviewActive,
  onOpenProblems,
  onOpenLanguageSelector,
}) => {
  const getLanguageLabel = (lang: FileLanguage) => {
    switch (lang) {
      case 'tsx': return 'TypeScript React';
      case 'jsx': return 'JavaScript React';
      case 'typescript': return 'TypeScript';
      case 'javascript': return 'JavaScript';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'json': return 'JSON';
      case 'markdown': return 'Markdown';
      case 'python': return 'Python';
      case 'bash': return 'Shell Script';
      default: return 'Plain Text';
    }
  };

  return (
    <footer
      style={{
        backgroundColor: theme.bgStatusBar,
        color: theme.fgStatusBar,
      }}
      className="h-6 px-2 flex items-center justify-between text-[11px] select-none shrink-0 z-30 font-sans"
    >
      {/* Left Items */}
      <div className="flex items-center gap-3">
        {/* Branch */}
        <button
          className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors"
          title="Git Branch: main"
        >
          <GitBranch size={12} />
          <span className="font-mono">main*</span>
          <RotateCw size={10} className="ml-0.5 opacity-80" />
        </button>

        {/* Problems */}
        <button
          onClick={onOpenProblems}
          className="flex items-center gap-2 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors"
          title={`${errorsCount} errors, ${warningsCount} warnings`}
        >
          <span className="flex items-center gap-0.5">
            <AlertCircle size={12} />
            <span className="font-mono tabular-nums">{errorsCount}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <AlertTriangle size={12} />
            <span className="font-mono tabular-nums">{warningsCount}</span>
          </span>
        </button>

        {/* Live Preview status */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] opacity-90">
          <Radio size={11} className={isLivePreviewActive ? 'text-emerald-300 animate-pulse' : 'text-neutral-400'} />
          <span>{isLivePreviewActive ? 'Preview Online' : 'Preview Standby'}</span>
        </div>
      </div>

      {/* Right Items */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Cursor Position */}
        <span className="hidden sm:inline font-mono">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>

        {/* Tab Size */}
        <span className="hidden md:inline font-mono">
          Spaces: {tabSize}
        </span>

        {/* Encoding & EOL */}
        <span className="hidden lg:inline">UTF-8</span>
        <span className="hidden lg:inline">LF</span>

        {/* Language selector */}
        <button
          onClick={onOpenLanguageSelector}
          className="hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors font-medium truncate max-w-[130px]"
        >
          {getLanguageLabel(language)}
        </button>

        {/* Prettier */}
        <span className="hidden sm:flex items-center gap-1 text-[10px] opacity-90">
          <Check size={11} className="text-emerald-300" />
          <span>Prettier</span>
        </span>

        {/* Notification Bell */}
        <button
          className="hover:bg-white/20 p-1 rounded transition-colors"
          title="Notifications"
        >
          <Bell size={12} />
        </button>
      </div>
    </footer>
  );
};
