import React from 'react';
import { 
  X, 
  Plus, 
  Split, 
  Play, 
  MoreHorizontal, 
  ChevronRight, 
  Code2, 
  FileCode,
  Sparkles,
  Command
} from 'lucide-react';
import { TabItem, WorkspaceFile, ThemeConfig, EditorSettings, ProblemItem } from '../../types';
import { FileIcon } from '../../utils/fileIcons';
import { CodeEditor } from './CodeEditor';
import { GitDiffView } from './GitDiffView';

interface EditorAreaProps {
  theme: ThemeConfig;
  settings: EditorSettings;
  openTabs: TabItem[];
  activeFileId: string | null;
  files: WorkspaceFile[];
  diffFile: WorkspaceFile | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewFile: () => void;
  onChangeContent: (fileId: string, newContent: string) => void;
  onCloseDiff: () => void;
  onStageFile: (fileId: string) => void;
  onDiscardFile: (fileId: string) => void;
  isSplitView: boolean;
  onToggleSplitView: () => void;
  onToggleLivePreview: () => void;
  breakpoints: { file: string; line: number; active: boolean }[];
  onToggleBreakpoint: (file: string, line: number) => void;
  problems: ProblemItem[];
  onCursorChange?: (line: number, col: number) => void;
  onOpenCommandPalette: () => void;
  targetLine?: number;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  theme,
  settings,
  openTabs,
  activeFileId,
  files,
  diffFile,
  onSelectTab,
  onCloseTab,
  onNewFile,
  onChangeContent,
  onCloseDiff,
  onStageFile,
  onDiscardFile,
  isSplitView,
  onToggleSplitView,
  onToggleLivePreview,
  breakpoints,
  onToggleBreakpoint,
  problems,
  onCursorChange,
  onOpenCommandPalette,
  targetLine,
}) => {
  // Helper to find a file in the workspace
  const findFileById = (id: string | null): WorkspaceFile | null => {
    if (!id) return null;
    let found: WorkspaceFile | null = null;
    const traverse = (items: WorkspaceFile[]) => {
      for (const item of items) {
        if (item.id === id) {
          found = item;
          return;
        }
        if (item.children) traverse(item.children);
      }
    };
    traverse(files);
    return found;
  };

  const activeFile = findFileById(activeFileId);

  // If in Git Diff View mode
  if (diffFile) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <GitDiffView
          theme={theme}
          file={diffFile}
          onClose={onCloseDiff}
          onStageFile={onStageFile}
          onDiscardFile={onDiscardFile}
        />
      </div>
    );
  }

  // Second file for split view (if enabled)
  const secondaryFile = isSplitView && openTabs.length > 1
    ? findFileById(openTabs.find((t) => t.fileId !== activeFileId)?.fileId || null)
    : null;

  return (
    <div 
      style={{ backgroundColor: theme.bgMain }}
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
    >
      {/* Tab Bar */}
      <div 
        style={{ 
          backgroundColor: theme.bgSidebar, 
          borderColor: theme.borderColor 
        }}
        className="h-9 flex items-center justify-between border-b shrink-0 overflow-x-auto"
      >
        {/* Left Tabs */}
        <div className="flex items-center h-full overflow-x-auto scrollbar-none">
          {openTabs.map((tab) => {
            const isActive = activeFileId === tab.fileId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.fileId)}
                style={{
                  backgroundColor: isActive ? theme.bgTabActive : theme.bgTabInactive,
                  borderRight: `1px solid ${theme.borderColor}`,
                  borderTop: isActive ? `2px solid ${theme.accent}` : '2px solid transparent',
                  color: isActive ? '#ffffff' : theme.textSecondary,
                }}
                className={`h-full px-3 flex items-center gap-2 text-xs cursor-pointer group shrink-0 transition-colors select-none`}
              >
                <FileIcon name={tab.title} size={14} />
                <span className="font-medium">{tab.title}</span>

                {/* Modified Indicator or Close Button */}
                <div className="flex items-center ml-1">
                  {tab.isDirty ? (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="w-2 h-2 rounded-full bg-white group-hover:hidden" 
                    />
                  ) : null}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className={`p-0.5 rounded hover:bg-white/20 hover:text-white text-neutral-400 ${
                      tab.isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={onNewFile}
            title="New File"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 ml-1 rounded"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Right Tab Controls */}
        <div className="flex items-center gap-1 px-2 text-neutral-400">
          <button
            onClick={onToggleLivePreview}
            title="Open Live Preview"
            className="p-1.5 hover:text-white hover:bg-white/10 rounded"
          >
            <Play size={13} />
          </button>
          <button
            onClick={onToggleSplitView}
            title="Split Editor Right"
            className={`p-1.5 rounded transition-colors ${
              isSplitView ? 'bg-white/15 text-white' : 'hover:text-white hover:bg-white/10'
            }`}
          >
            <Split size={13} />
          </button>
          <button
            onClick={onOpenCommandPalette}
            title="More Editor Actions"
            className="p-1.5 hover:text-white hover:bg-white/10 rounded"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      {activeFile && (
        <div 
          style={{ borderColor: theme.borderColor }}
          className="h-6 px-4 flex items-center gap-1 text-[11px] text-neutral-400 border-b shrink-0 font-sans"
        >
          <span>workspace</span>
          <ChevronRight size={12} className="text-neutral-600" />
          <span className="text-neutral-300">{activeFile.path.split('/')[0]}</span>
          {activeFile.path.includes('/') && (
            <>
              <ChevronRight size={12} className="text-neutral-600" />
              <span className="text-neutral-200 font-medium">{activeFile.name}</span>
            </>
          )}
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeFile ? (
          <div className={`flex-1 flex h-full ${isSplitView && secondaryFile ? 'grid grid-cols-2 divide-x divide-white/10' : ''}`}>
            {/* Primary Editor Pane */}
            <CodeEditor
              file={activeFile}
              theme={theme}
              settings={settings}
              problems={problems.filter((p) => p.fileId === activeFile.id)}
              breakpoints={breakpoints
                .filter((bp) => bp.file === activeFile.name && bp.active)
                .map((bp) => bp.line)}
              onToggleBreakpoint={(line) => onToggleBreakpoint(activeFile.name, line)}
              onChangeContent={(newContent) => onChangeContent(activeFile.id, newContent)}
              onCursorChange={onCursorChange}
              initialLine={targetLine}
            />

            {/* Split View Secondary Editor Pane */}
            {isSplitView && secondaryFile && (
              <CodeEditor
                file={secondaryFile}
                theme={theme}
                settings={settings}
                problems={problems.filter((p) => p.fileId === secondaryFile.id)}
                breakpoints={breakpoints
                  .filter((bp) => bp.file === secondaryFile.name && bp.active)
                  .map((bp) => bp.line)}
                onToggleBreakpoint={(line) => onToggleBreakpoint(secondaryFile.name, line)}
                onChangeContent={(newContent) => onChangeContent(secondaryFile.id, newContent)}
              />
            )}
          </div>
        ) : (
          /* Empty Workspace Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 font-sans space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#007acc]/20 border border-[#007acc]/40 flex items-center justify-center text-[#007acc]">
              <Code2 size={36} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Studio Code</h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                In-browser cloud IDE designed with full Visual Studio Code ergonomics and live runtime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full text-xs">
              <button
                onClick={onNewFile}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-between text-neutral-200 transition-colors"
              >
                <span>New Text File</span>
                <span className="font-mono text-[10px] text-neutral-500">Ctrl+N</span>
              </button>
              <button
                onClick={onOpenCommandPalette}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-between text-neutral-200 transition-colors"
              >
                <span>Show All Commands</span>
                <span className="font-mono text-[10px] text-neutral-500">Ctrl+Shift+P</span>
              </button>
              <button
                onClick={onToggleLivePreview}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-between text-neutral-200 transition-colors"
              >
                <span>Open Live Preview</span>
                <span className="font-mono text-[10px] text-neutral-500">F5</span>
              </button>
              <button
                onClick={() => {
                  const defaultFile = files.find((f) => f.name === 'App.tsx');
                  if (defaultFile) onSelectTab(defaultFile.id);
                }}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-between text-neutral-200 transition-colors"
              >
                <span>Open App.tsx</span>
                <span className="font-mono text-[10px] text-[#007acc]">Primary</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
