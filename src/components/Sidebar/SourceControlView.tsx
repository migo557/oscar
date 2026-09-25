import React, { useState } from 'react';
import { 
  GitBranch, 
  Check, 
  Plus, 
  Minus, 
  RotateCcw, 
  FileDiff, 
  ChevronDown, 
  ChevronRight,
  GitCommit as GitCommitIcon,
  RefreshCw
} from 'lucide-react';
import { WorkspaceFile, GitCommit, ThemeConfig } from '../../types';
import { FileIcon } from '../../utils/fileIcons';

interface SourceControlViewProps {
  theme: ThemeConfig;
  modifiedFiles: WorkspaceFile[];
  stagedFiles: WorkspaceFile[];
  onStageFile: (fileId: string) => void;
  onUnstageFile: (fileId: string) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  onDiscardFile: (fileId: string) => void;
  onOpenDiff: (file: WorkspaceFile) => void;
  onCommit: (message: string) => void;
  commitHistory: GitCommit[];
}

export const SourceControlView: React.FC<SourceControlViewProps> = ({
  theme,
  modifiedFiles,
  stagedFiles,
  onStageFile,
  onUnstageFile,
  onStageAll,
  onUnstageAll,
  onDiscardFile,
  onOpenDiff,
  onCommit,
  commitHistory,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isStagedOpen, setIsStagedOpen] = useState(true);
  const [isChangesOpen, setIsChangesOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    onCommit(commitMessage.trim());
    setCommitMessage('');
  };

  const totalChanges = modifiedFiles.length + stagedFiles.length;

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="h-8 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide text-neutral-300 uppercase border-b border-white/5 shrink-0">
        <span>Source Control: Git</span>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <GitBranch size={13} />
          <span className="font-mono text-neutral-300">main</span>
        </div>
      </div>

      {/* Commit Box */}
      <div className="p-3 border-b border-white/5 space-y-2">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleCommit();
            }
          }}
          placeholder="Message (Ctrl+Enter to commit on 'main')"
          rows={3}
          className="w-full bg-[#1e1e1e] border border-neutral-700 focus:border-[#007acc] text-xs text-white p-2 rounded-sm outline-none resize-none"
        />

        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || totalChanges === 0}
          className="w-full h-7 bg-[#007acc] hover:bg-[#0062a3] disabled:opacity-40 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Check size={14} />
          <span>Commit</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Staged Changes Section */}
        {stagedFiles.length > 0 && (
          <div className="border-b border-white/5">
            <div className="h-6 px-3 flex items-center justify-between text-[11px] font-semibold text-neutral-400 group">
              <button
                onClick={() => setIsStagedOpen(!isStagedOpen)}
                className="flex items-center gap-1 hover:text-white uppercase"
              >
                {isStagedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Staged Changes</span>
                <span className="font-mono text-neutral-500">({stagedFiles.length})</span>
              </button>
              <button
                onClick={onUnstageAll}
                title="Unstage All Changes"
                className="opacity-0 group-hover:opacity-100 hover:text-white p-0.5"
              >
                <Minus size={13} />
              </button>
            </div>

            {isStagedOpen && (
              <div className="pb-1">
                {stagedFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onOpenDiff(file)}
                    className="h-6 pl-6 pr-2 flex items-center justify-between hover:bg-white/5 cursor-pointer group text-neutral-300"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon name={file.name} size={14} />
                      <span className="truncate">{file.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">M</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnstageFile(file.id);
                        }}
                        title="Unstage Changes"
                        className="hover:text-white p-0.5"
                      >
                        <Minus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Working Tree Changes Section */}
        <div className="border-b border-white/5">
          <div className="h-6 px-3 flex items-center justify-between text-[11px] font-semibold text-neutral-400 group">
            <button
              onClick={() => setIsChangesOpen(!isChangesOpen)}
              className="flex items-center gap-1 hover:text-white uppercase"
            >
              {isChangesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Changes</span>
              <span className="font-mono text-neutral-500">({modifiedFiles.length})</span>
            </button>

            {modifiedFiles.length > 0 && (
              <button
                onClick={onStageAll}
                title="Stage All Changes"
                className="opacity-0 group-hover:opacity-100 hover:text-white p-0.5"
              >
                <Plus size={13} />
              </button>
            )}
          </div>

          {isChangesOpen && (
            <div className="pb-1">
              {modifiedFiles.length === 0 ? (
                <div className="px-6 py-2 text-neutral-500 text-[11px]">
                  No changes detected in working tree.
                </div>
              ) : (
                modifiedFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onOpenDiff(file)}
                    className="h-6 pl-6 pr-2 flex items-center justify-between hover:bg-white/5 cursor-pointer group text-neutral-300"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon name={file.name} size={14} />
                      <span className="truncate">{file.name}</span>
                      <span className="text-[10px] text-amber-400 font-mono">M</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDiscardFile(file.id);
                        }}
                        title="Discard Changes"
                        className="hover:text-white p-0.5"
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStageFile(file.id);
                        }}
                        title="Stage Changes"
                        className="hover:text-white p-0.5"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Commit History */}
        <div>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full h-6 px-3 flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-white uppercase"
          >
            {isHistoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Commit History</span>
            <span className="font-mono text-neutral-500">({commitHistory.length})</span>
          </button>

          {isHistoryOpen && (
            <div className="py-1">
              {commitHistory.map((c) => (
                <div key={c.id} className="px-4 py-2 hover:bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-2 font-medium text-white text-xs truncate">
                    <GitCommitIcon size={13} className="text-neutral-400 shrink-0" />
                    <span className="truncate">{c.message}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span>{c.author}</span>
                    <span className="font-mono text-neutral-500">{c.hash}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
