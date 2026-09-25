import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { ProblemItem, ThemeConfig } from '../../types';

interface ProblemsViewProps {
  theme: ThemeConfig;
  problems: ProblemItem[];
  onSelectProblem: (fileId: string, line: number) => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({
  theme,
  problems,
  onSelectProblem,
}) => {
  if (problems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-neutral-500 text-xs">
        <CheckCircle2 size={24} className="text-emerald-500/80 mb-2" />
        <span>No problems have been detected in the workspace.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-white/5 font-mono text-xs select-none">
      {problems.map((prob) => (
        <div
          key={prob.id}
          onClick={() => onSelectProblem(prob.fileId, prob.line)}
          className="px-4 py-2 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 truncate">
            {prob.severity === 'error' ? (
              <AlertCircle size={14} className="text-red-400 shrink-0" />
            ) : prob.severity === 'warning' ? (
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            ) : (
              <Info size={14} className="text-blue-400 shrink-0" />
            )}
            <span className="text-neutral-200 truncate">{prob.message}</span>
            <span className="text-neutral-500 font-sans text-[11px] truncate">[{prob.source}]</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400 text-[11px] shrink-0 font-sans ml-4">
            <span className="text-neutral-300 font-mono">{prob.fileName}</span>
            <span className="text-neutral-500 font-mono">[{prob.line}, {prob.col}]</span>
          </div>
        </div>
      ))}
    </div>
  );
};
