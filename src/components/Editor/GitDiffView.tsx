import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Check, X, Split, FileDiff } from 'lucide-react';
import { WorkspaceFile, ThemeConfig } from '../../types';
import { FileIcon } from '../../utils/fileIcons';

interface GitDiffViewProps {
  theme: ThemeConfig;
  file: WorkspaceFile;
  onClose: () => void;
  onStageFile: (fileId: string) => void;
  onDiscardFile: (fileId: string) => void;
}

export const GitDiffView: React.FC<GitDiffViewProps> = ({
  theme,
  file,
  onClose,
  onStageFile,
  onDiscardFile,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const originalLines = (file.initialContent || '').split('\n');
  const currentLines = file.content.split('\n');

  // Compute a simple line-by-line diff mapping
  const maxLines = Math.max(originalLines.length, currentLines.length);
  const diffRows: { orig?: string; curr?: string; type: 'added' | 'removed' | 'modified' | 'same' }[] = [];

  for (let i = 0; i < maxLines; i++) {
    const orig = originalLines[i];
    const curr = currentLines[i];

    if (orig === undefined) {
      diffRows.push({ curr, type: 'added' });
    } else if (curr === undefined) {
      diffRows.push({ orig, type: 'removed' });
    } else if (orig !== curr) {
      diffRows.push({ orig, curr, type: 'modified' });
    } else {
      diffRows.push({ orig, curr, type: 'same' });
    }
  }

  return (
    <div 
      style={{ backgroundColor: theme.bgMain, color: theme.textPrimary }}
      className="flex-1 flex flex-col h-full overflow-hidden select-none font-mono text-xs"
    >
      {/* Diff Toolbar */}
      <div 
        style={{ borderColor: theme.borderColor, backgroundColor: theme.bgSidebar }}
        className="h-9 px-4 flex items-center justify-between border-b shrink-0 text-xs"
      >
        <div className="flex items-center gap-2">
          <FileIcon name={file.name} size={15} />
          <span className="font-semibold text-white">{file.name}</span>
          <span className="text-neutral-400 font-sans text-[11px]">(Working Tree Diff)</span>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
            className="px-2 py-1 bg-white/10 hover:bg-white/15 text-neutral-300 rounded text-xs flex items-center gap-1"
          >
            <Split size={12} />
            <span>{viewMode === 'split' ? 'Unified View' : 'Side-by-Side'}</span>
          </button>

          <button
            onClick={() => onDiscardFile(file.id)}
            title="Discard all changes in this file"
            className="px-2 py-1 bg-neutral-800 hover:bg-red-900/60 hover:text-red-200 text-neutral-300 rounded text-xs flex items-center gap-1 border border-neutral-700"
          >
            <RotateCcw size={12} />
            <span>Discard</span>
          </button>

          <button
            onClick={() => onStageFile(file.id)}
            title="Stage this file"
            className="px-2 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs flex items-center gap-1 font-medium"
          >
            <Check size={12} />
            <span>Stage File</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:text-white text-neutral-400 ml-1"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-2 divide-x divide-white/10 min-w-[700px]">
            {/* Left: Original File */}
            <div className="flex flex-col">
              <div className="h-6 px-3 bg-neutral-900/80 border-b border-white/10 text-neutral-400 text-[10px] uppercase font-sans font-semibold sticky top-0 z-10 flex items-center justify-between">
                <span>Original (Git HEAD)</span>
                <span>{originalLines.length} lines</span>
              </div>
              <div>
                {diffRows.map((row, idx) => {
                  const isRemoved = row.type === 'removed' || row.type === 'modified';
                  return (
                    <div
                      key={idx}
                      className={`h-5 flex items-center px-2 ${
                        isRemoved ? 'bg-red-950/40 text-red-300' : 'text-neutral-400'
                      }`}
                    >
                      <span className="w-8 text-neutral-600 select-none text-right pr-2">
                        {row.orig !== undefined ? idx + 1 : ''}
                      </span>
                      <span className="w-4 select-none text-neutral-500 font-bold">
                        {isRemoved ? '-' : ''}
                      </span>
                      <pre className="truncate">{row.orig ?? ''}</pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Working Tree File */}
            <div className="flex flex-col">
              <div className="h-6 px-3 bg-neutral-900/80 border-b border-white/10 text-neutral-400 text-[10px] uppercase font-sans font-semibold sticky top-0 z-10 flex items-center justify-between">
                <span>Modified (Working Tree)</span>
                <span>{currentLines.length} lines</span>
              </div>
              <div>
                {diffRows.map((row, idx) => {
                  const isAdded = row.type === 'added' || row.type === 'modified';
                  return (
                    <div
                      key={idx}
                      className={`h-5 flex items-center px-2 ${
                        isAdded ? 'bg-emerald-950/40 text-emerald-300' : 'text-neutral-300'
                      }`}
                    >
                      <span className="w-8 text-neutral-600 select-none text-right pr-2">
                        {row.curr !== undefined ? idx + 1 : ''}
                      </span>
                      <span className="w-4 select-none text-neutral-500 font-bold">
                        {isAdded ? '+' : ''}
                      </span>
                      <pre className="truncate">{row.curr ?? ''}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Unified View */
          <div className="min-w-[500px]">
            {diffRows.map((row, idx) => {
              if (row.type === 'same') {
                return (
                  <div key={idx} className="h-5 flex items-center px-2 text-neutral-400">
                    <span className="w-10 text-neutral-600 select-none text-right pr-3">
                      {idx + 1}
                    </span>
                    <span className="w-4 select-none text-neutral-600"> </span>
                    <pre className="truncate">{row.curr}</pre>
                  </div>
                );
              }
              if (row.type === 'modified') {
                return (
                  <React.Fragment key={idx}>
                    <div className="h-5 flex items-center px-2 bg-red-950/40 text-red-300">
                      <span className="w-10 text-neutral-600 select-none text-right pr-3">
                        {idx + 1}
                      </span>
                      <span className="w-4 select-none font-bold">-</span>
                      <pre className="truncate">{row.orig}</pre>
                    </div>
                    <div className="h-5 flex items-center px-2 bg-emerald-950/40 text-emerald-300">
                      <span className="w-10 text-neutral-600 select-none text-right pr-3">
                        {idx + 1}
                      </span>
                      <span className="w-4 select-none font-bold">+</span>
                      <pre className="truncate">{row.curr}</pre>
                    </div>
                  </React.Fragment>
                );
              }
              if (row.type === 'added') {
                return (
                  <div key={idx} className="h-5 flex items-center px-2 bg-emerald-950/40 text-emerald-300">
                    <span className="w-10 text-neutral-600 select-none text-right pr-3">
                      {idx + 1}
                    </span>
                    <span className="w-4 select-none font-bold">+</span>
                    <pre className="truncate">{row.curr}</pre>
                  </div>
                );
              }
              return (
                <div key={idx} className="h-5 flex items-center px-2 bg-red-950/40 text-red-300">
                  <span className="w-10 text-neutral-600 select-none text-right pr-3">
                    {idx + 1}
                  </span>
                  <span className="w-4 select-none font-bold">-</span>
                  <pre className="truncate">{row.orig}</pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
