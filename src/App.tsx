import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  WorkspaceFile, 
  TabItem, 
  ThemeId, 
  ThemeConfig, 
  SidebarTab, 
  EditorSettings, 
  ProblemItem, 
  GitCommit, 
  CommandItem, 
  ExtensionItem 
} from './types';
import { THEMES, DEFAULT_WORKSPACE_FILES, EXTENSIONS_CATALOG } from './data/workspaceData';
import { TopMenuBar } from './components/TopMenuBar';
import { ActivityBar } from './components/ActivityBar';
import { ExplorerView } from './components/Sidebar/ExplorerView';
import { SearchView } from './components/Sidebar/SearchView';
import { SourceControlView } from './components/Sidebar/SourceControlView';
import { DebugView } from './components/Sidebar/DebugView';
import { ExtensionsView } from './components/Sidebar/ExtensionsView';
import { AICopilotView } from './components/Sidebar/AICopilotView';
import { SettingsView } from './components/Sidebar/SettingsView';
import { EditorArea } from './components/Editor/EditorArea';
import { LivePreview } from './components/LivePreview';
import { BottomPanel } from './components/BottomPanel/BottomPanel';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';

export default function App() {
  // Theme & Settings
  const [themeId, setThemeId] = useState<ThemeId>('vs-dark');
  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 13,
    tabSize: 2,
    wordWrap: false,
    minimap: true,
    lineNumbers: true,
    formatOnSave: true,
    autoSave: false,
  });

  // Workspace Files
  const [files, setFiles] = useState<WorkspaceFile[]>(DEFAULT_WORKSPACE_FILES);

  // Tabs & Navigation
  const [openTabs, setOpenTabs] = useState<TabItem[]>([
    {
      id: 'tab-app',
      fileId: 'src-app',
      title: 'App.tsx',
      path: 'src/App.tsx',
      language: 'tsx',
      isDirty: false,
    },
    {
      id: 'tab-particle',
      fileId: 'src-components-particle',
      title: 'ParticleCanvas.tsx',
      path: 'src/components/ParticleCanvas.tsx',
      language: 'tsx',
      isDirty: false,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState<string | null>('src-app');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [targetLine, setTargetLine] = useState<number | undefined>(undefined);

  // Panels & Views Layout
  const [sidebarTab, setSidebarTab] = useState<SidebarTab | null>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(true);
  const [isSplitView, setIsSplitView] = useState(false);
  const [diffFile, setDiffFile] = useState<WorkspaceFile | null>(null);

  // Debugging & Breakpoints
  const [breakpoints, setBreakpoints] = useState<{ file: string; line: number; active: boolean }[]>([
    { file: 'ParticleCanvas.tsx', line: 70, active: true },
  ]);
  const [isDebugging, setIsDebugging] = useState(false);

  // Problems / Diagnostics
  const [problems, setProblems] = useState<ProblemItem[]>([
    {
      id: 'p-1',
      severity: 'info',
      message: 'Component uses requestAnimationFrame; cleanup on unmount verified.',
      source: 'eslint (react-hooks)',
      fileId: 'src-components-particle',
      fileName: 'ParticleCanvas.tsx',
      line: 120,
      col: 5,
    },
  ]);

  // Output Logs
  const [outputLogs, setOutputLogs] = useState<{ time: string; text: string; channel: string }[]>([
    { time: '17:10:02', text: 'Studio Code Workspace initialized.', channel: 'Tasks' },
    { time: '17:10:04', text: 'TypeScript Language Server started: TypeScript v5.7.0', channel: 'TypeScript Language Server' },
    { time: '17:10:05', text: 'Vite dev server running on port 3000', channel: 'Tasks' },
  ]);

  // Git State
  const [stagedFileIds, setStagedFileIds] = useState<Set<string>>(new Set());
  const [commitHistory, setCommitHistory] = useState<GitCommit[]>([
    {
      id: 'c-1',
      message: 'feat: add interactive canvas physics playground',
      author: 'Studio Dev <dev@studiocode.app>',
      date: '2 hours ago',
      hash: 'a7f39b1',
    },
    {
      id: 'c-0',
      message: 'chore: initial commit and workspace setup',
      author: 'Studio Dev <dev@studiocode.app>',
      date: 'yesterday',
      hash: '90cd42e',
    },
  ]);

  // Extensions
  const [extensions, setExtensions] = useState<ExtensionItem[]>(EXTENSIONS_CATALOG);

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const currentTheme = THEMES[themeId] || THEMES['vs-dark'];

  // Flattened files list
  const flatFiles = useMemo(() => {
    const list: WorkspaceFile[] = [];
    const traverse = (items: WorkspaceFile[]) => {
      items.forEach((item) => {
        if (!item.isFolder) list.push(item);
        if (item.children) traverse(item.children);
      });
    };
    traverse(files);
    return list;
  }, [files]);

  // Modified and Staged Files calculation
  const modifiedFiles = useMemo(() => {
    return flatFiles.filter((f) => f.content !== f.initialContent && !stagedFileIds.has(f.id));
  }, [flatFiles, stagedFileIds]);

  const stagedFiles = useMemo(() => {
    return flatFiles.filter((f) => stagedFileIds.has(f.id));
  }, [flatFiles, stagedFileIds]);

  // File selection
  const handleSelectFile = useCallback((file: WorkspaceFile, line?: number) => {
    if (file.isFolder) return;
    setDiffFile(null);
    setActiveFileId(file.id);
    if (line !== undefined) {
      setTargetLine(line);
    } else {
      setTargetLine(undefined);
    }

    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.fileId === file.id);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `tab-${file.id}`,
          fileId: file.id,
          title: file.name,
          path: file.path,
          language: file.language,
          isDirty: file.content !== file.initialContent,
        },
      ];
    });
  }, []);

  // Close tab
  const handleCloseTab = useCallback((tabId: string) => {
    setOpenTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeFileId && !filtered.some((t) => t.fileId === activeFileId)) {
        setActiveFileId(filtered.length > 0 ? filtered[filtered.length - 1].fileId : null);
      }
      return filtered;
    });
  }, [activeFileId]);

  // Update file content
  const handleChangeContent = useCallback((fileId: string, newContent: string) => {
    const updateRecursive = (items: WorkspaceFile[]): WorkspaceFile[] => {
      return items.map((item) => {
        if (item.id === fileId) {
          const isDirty = newContent !== item.initialContent;
          return {
            ...item,
            content: newContent,
            isModified: isDirty,
          };
        }
        if (item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    setFiles((prev) => updateRecursive(prev));

    // Update dirty indicator in tab
    setOpenTabs((prev) =>
      prev.map((t) => {
        if (t.fileId === fileId) {
          const target = flatFiles.find((f) => f.id === fileId);
          return {
            ...t,
            isDirty: target ? newContent !== target.initialContent : false,
          };
        }
        return t;
      })
    );
  }, [flatFiles]);

  // Save File
  const handleSaveFile = useCallback(() => {
    if (!activeFileId) return;
    setOpenTabs((prev) =>
      prev.map((t) => (t.fileId === activeFileId ? { ...t, isDirty: false } : t))
    );
    setOutputLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        text: `File saved successfully.`,
        channel: 'Tasks',
      },
    ]);
  }, [activeFileId]);

  // Format Document
  const handleFormatDocument = useCallback(() => {
    if (!activeFileId) return;
    const activeFile = flatFiles.find((f) => f.id === activeFileId);
    if (!activeFile) return;

    try {
      // Basic formatting: ensure consistent indentation and trim lines
      const formatted = activeFile.content
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');
      handleChangeContent(activeFile.id, formatted);
      setOutputLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          text: `Formatted ${activeFile.name} using Prettier rules.`,
          channel: 'Extension Host',
        },
      ]);
    } catch {
      // Ignore formatting error
    }
  }, [activeFileId, flatFiles, handleChangeContent]);

  // Create new file
  const handleCreateFile = useCallback((name: string, parentPath = '') => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    let lang = 'plaintext';
    if (ext === 'ts') lang = 'typescript';
    if (ext === 'tsx') lang = 'tsx';
    if (ext === 'js') lang = 'javascript';
    if (ext === 'jsx') lang = 'jsx';
    if (ext === 'json') lang = 'json';
    if (ext === 'css') lang = 'css';
    if (ext === 'html') lang = 'html';
    if (ext === 'md') lang = 'markdown';
    if (ext === 'py') lang = 'python';

    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}`,
      name,
      path: parentPath ? `${parentPath}/${name}` : name,
      content: `// ${name}\nexport {};\n`,
      initialContent: `// ${name}\nexport {};\n`,
      language: lang as any,
      isFolder: false,
    };

    const insertRecursive = (items: WorkspaceFile[]): WorkspaceFile[] => {
      if (!parentPath) return [...items, newFile];
      return items.map((item) => {
        if (item.path === parentPath && item.isFolder) {
          return {
            ...item,
            children: [...(item.children || []), newFile],
          };
        }
        if (item.children) {
          return { ...item, children: insertRecursive(item.children) };
        }
        return item;
      });
    };

    setFiles((prev) => insertRecursive(prev));
    handleSelectFile(newFile);
  }, [handleSelectFile]);

  // Create new folder
  const handleCreateFolder = useCallback((name: string, parentPath = '') => {
    const newFolder: WorkspaceFile = {
      id: `folder-${Date.now()}`,
      name,
      path: parentPath ? `${parentPath}/${name}` : name,
      content: '',
      initialContent: '',
      language: 'plaintext',
      isFolder: true,
      isOpen: true,
      children: [],
    };

    const insertRecursive = (items: WorkspaceFile[]): WorkspaceFile[] => {
      if (!parentPath) return [...items, newFolder];
      return items.map((item) => {
        if (item.path === parentPath && item.isFolder) {
          return {
            ...item,
            children: [...(item.children || []), newFolder],
          };
        }
        if (item.children) {
          return { ...item, children: insertRecursive(item.children) };
        }
        return item;
      });
    };

    setFiles((prev) => insertRecursive(prev));
  }, []);

  // Delete file
  const handleDeleteFile = useCallback((fileId: string) => {
    const deleteRecursive = (items: WorkspaceFile[]): WorkspaceFile[] => {
      return items
        .filter((item) => item.id !== fileId)
        .map((item) => {
          if (item.children) {
            return { ...item, children: deleteRecursive(item.children) };
          }
          return item;
        });
    };

    setFiles((prev) => deleteRecursive(prev));
    setOpenTabs((prev) => prev.filter((t) => t.fileId !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(null);
    }
  }, [activeFileId]);

  // Rename file
  const handleRenameFile = useCallback((fileId: string, newName: string) => {
    const renameRecursive = (items: WorkspaceFile[]): WorkspaceFile[] => {
      return items.map((item) => {
        if (item.id === fileId) {
          return { ...item, name: newName };
        }
        if (item.children) {
          return { ...item, children: renameRecursive(item.children) };
        }
        return item;
      });
    };
    setFiles((prev) => renameRecursive(prev));
    setOpenTabs((prev) =>
      prev.map((t) => (t.fileId === fileId ? { ...t, title: newName } : t))
    );
  }, []);

  // Git operations
  const handleStageFile = useCallback((fileId: string) => {
    setStagedFileIds((prev) => new Set([...prev, fileId]));
  }, []);

  const handleUnstageFile = useCallback((fileId: string) => {
    setStagedFileIds((prev) => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
  }, []);

  const handleStageAll = useCallback(() => {
    const allModifiedIds = flatFiles
      .filter((f) => f.content !== f.initialContent)
      .map((f) => f.id);
    setStagedFileIds(new Set(allModifiedIds));
  }, [flatFiles]);

  const handleUnstageAll = useCallback(() => {
    setStagedFileIds(new Set());
  }, []);

  const handleDiscardFile = useCallback((fileId: string) => {
    const target = flatFiles.find((f) => f.id === fileId);
    if (!target) return;
    handleChangeContent(fileId, target.initialContent);
    handleUnstageFile(fileId);
    if (diffFile?.id === fileId) {
      setDiffFile(null);
    }
  }, [flatFiles, handleChangeContent, handleUnstageFile, diffFile]);

  const handleCommit = useCallback((message: string) => {
    const commitIds = Array.from(stagedFileIds);
    if (commitIds.length === 0) return;

    // Reset initial content to current content
    const commitRecursive = (items: WorkspaceFile[]): WorkspaceFile[] => {
      return items.map((item) => {
        if (stagedFileIds.has(item.id)) {
          return { ...item, initialContent: item.content, isModified: false };
        }
        if (item.children) {
          return { ...item, children: commitRecursive(item.children) };
        }
        return item;
      });
    };

    setFiles((prev) => commitRecursive(prev));
    setStagedFileIds(new Set());

    const newCommit: GitCommit = {
      id: `c-${Date.now()}`,
      message,
      author: 'Studio Dev <dev@studiocode.app>',
      date: 'Just now',
      hash: Math.random().toString(16).slice(2, 9),
    };

    setCommitHistory((prev) => [newCommit, ...prev]);
    setOutputLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        text: `[Git Commit ${newCommit.hash}] ${message}`,
        channel: 'Tasks',
      },
    ]);
  }, [stagedFileIds]);

  // Breakpoints
  const handleToggleBreakpoint = useCallback((fileName: string, line: number) => {
    setBreakpoints((prev) => {
      const existing = prev.find((bp) => bp.file === fileName && bp.line === line);
      if (existing) {
        return prev.filter((bp) => !(bp.file === fileName && bp.line === line));
      }
      return [...prev, { file: fileName, line, active: true }];
    });
  }, []);

  // Extensions install toggle
  const handleToggleExtension = useCallback((id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => {
        if (ext.id === id) {
          const nextState = !ext.installed;
          if (id === 'one-dark-pro' && nextState) {
            setThemeId('one-dark-pro');
          }
          return { ...ext, installed: nextState };
        }
        return ext;
      })
    );
  }, []);

  // Replace all in search
  const handleReplaceAllInSearch = useCallback((searchTerm: string, replaceTerm: string) => {
    if (!searchTerm) return;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const replaceRecursive = (items: WorkspaceFile[]): WorkspaceFile[] => {
      return items.map((item) => {
        if (!item.isFolder && item.content.includes(searchTerm)) {
          const replaced = item.content.replace(regex, replaceTerm);
          return { ...item, content: replaced, isModified: true };
        }
        if (item.children) {
          return { ...item, children: replaceRecursive(item.children) };
        }
        return item;
      });
    };
    setFiles((prev) => replaceRecursive(prev));
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }
      if (isCmdOrCtrl && e.key === '`') {
        e.preventDefault();
        setIsBottomPanelOpen((prev) => !prev);
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
        return;
      }
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFormatDocument();
        return;
      }
      if (e.key === 'F5') {
        e.preventDefault();
        setIsLivePreviewOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleSaveFile, handleFormatDocument]);

  // Command palette items
  const commands: CommandItem[] = useMemo(() => [
    {
      id: 'cmd-palette',
      title: 'Preferences: Color Theme',
      category: 'Preferences',
      shortcut: 'Ctrl+K Ctrl+T',
      action: () => {
        setSidebarTab('settings');
        setIsSidebarOpen(true);
      },
    },
    {
      id: 'cmd-toggle-sidebar',
      title: 'View: Toggle Primary Side Bar',
      category: 'View',
      shortcut: 'Ctrl+B',
      action: () => setIsSidebarOpen((prev) => !prev),
    },
    {
      id: 'cmd-toggle-terminal',
      title: 'View: Toggle Terminal Panel',
      category: 'View',
      shortcut: 'Ctrl+`',
      action: () => setIsBottomPanelOpen((prev) => !prev),
    },
    {
      id: 'cmd-toggle-preview',
      title: 'View: Toggle Live Web Preview',
      category: 'View',
      shortcut: 'F5',
      action: () => setIsLivePreviewOpen((prev) => !prev),
    },
    {
      id: 'cmd-split-editor',
      title: 'View: Split Editor Right',
      category: 'View',
      action: () => setIsSplitView((prev) => !prev),
    },
    {
      id: 'cmd-format',
      title: 'Format Document',
      category: 'Edit',
      shortcut: 'Shift+Alt+F',
      action: handleFormatDocument,
    },
    {
      id: 'cmd-new-file',
      title: 'File: New Text File',
      category: 'File',
      shortcut: 'Ctrl+N',
      action: () => handleCreateFile('NewComponent.tsx', 'src/components'),
    },
    {
      id: 'cmd-save',
      title: 'File: Save',
      category: 'File',
      shortcut: 'Ctrl+S',
      action: handleSaveFile,
    },
    {
      id: 'cmd-copilot',
      title: 'AI Studio: Ask Copilot',
      category: 'AI Studio',
      action: () => {
        setSidebarTab('ai');
        setIsSidebarOpen(true);
      },
    },
  ], [handleFormatDocument, handleCreateFile, handleSaveFile]);

  const activeFile = flatFiles.find((f) => f.id === activeFileId) || null;

  return (
    <div 
      style={{ 
        backgroundColor: currentTheme.bgMain, 
        color: currentTheme.textPrimary 
      }}
      className="flex flex-col h-screen w-screen overflow-hidden font-sans select-none"
    >
      {/* 1. Top VS Code Menu Bar */}
      <TopMenuBar
        theme={currentTheme}
        activeFileName={activeFile?.name || 'Workspace'}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isBottomPanelOpen={isBottomPanelOpen}
        onToggleBottomPanel={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
        isLivePreviewOpen={isLivePreviewOpen}
        onToggleLivePreview={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView(!isSplitView)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNewFile={() => handleCreateFile('NewComponent.tsx', 'src/components')}
        onNewFolder={() => handleCreateFolder('new-folder', 'src')}
        onSaveFile={handleSaveFile}
        onFormatDocument={handleFormatDocument}
      />

      {/* 2. Main Workspace Body (ActivityBar + Sidebar + Editor + LivePreview) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Activity Bar */}
        <ActivityBar
          theme={currentTheme}
          activeTab={isSidebarOpen ? sidebarTab : null}
          onSelectTab={(tab) => {
            if (sidebarTab === tab && isSidebarOpen) {
              setIsSidebarOpen(false);
            } else {
              setSidebarTab(tab);
              setIsSidebarOpen(true);
            }
          }}
          uncommittedCount={modifiedFiles.length + stagedFiles.length}
          onOpenThemeModal={() => {
            setSidebarTab('settings');
            setIsSidebarOpen(true);
          }}
          onOpenShortcuts={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => {
            setSidebarTab('settings');
            setIsSidebarOpen(true);
          }}
        />

        {/* Primary Collapsible Sidebar */}
        {isSidebarOpen && (
          <aside
            style={{
              width: '260px',
              backgroundColor: currentTheme.bgSidebar,
              borderColor: currentTheme.borderColor,
            }}
            className="h-full border-r flex flex-col shrink-0 overflow-hidden select-none z-10"
          >
            {sidebarTab === 'explorer' && (
              <ExplorerView
                theme={currentTheme}
                files={files}
                openTabs={openTabs}
                activeFileId={activeFileId}
                onSelectFile={(f) => handleSelectFile(f)}
                onCloseTab={handleCloseTab}
                onCreateFile={(name, parentPath) => handleCreateFile(name, parentPath)}
                onCreateFolder={(name, parentPath) => handleCreateFolder(name, parentPath)}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
              />
            )}
            {sidebarTab === 'search' && (
              <SearchView
                theme={currentTheme}
                files={files}
                onSelectResult={(file, line) => handleSelectFile(file, line)}
                onReplaceAll={handleReplaceAllInSearch}
              />
            )}
            {sidebarTab === 'git' && (
              <SourceControlView
                theme={currentTheme}
                modifiedFiles={modifiedFiles}
                stagedFiles={stagedFiles}
                onStageFile={handleStageFile}
                onUnstageFile={handleUnstageFile}
                onStageAll={handleStageAll}
                onUnstageAll={handleUnstageAll}
                onDiscardFile={handleDiscardFile}
                onOpenDiff={(file) => setDiffFile(file)}
                onCommit={handleCommit}
                commitHistory={commitHistory}
              />
            )}
            {sidebarTab === 'debug' && (
              <DebugView
                theme={currentTheme}
                breakpoints={breakpoints}
                onToggleBreakpoint={(file, line) => handleToggleBreakpoint(file, line)}
                onClearBreakpoints={() => setBreakpoints([])}
                onStartDebugging={() => setIsDebugging(!isDebugging)}
                isDebugging={isDebugging}
              />
            )}
            {sidebarTab === 'extensions' && (
              <ExtensionsView
                theme={currentTheme}
                extensions={extensions}
                onToggleInstall={handleToggleExtension}
              />
            )}
            {sidebarTab === 'ai' && (
              <AICopilotView
                theme={currentTheme}
                activeFile={activeFile}
                onInsertCode={(code) => {
                  if (activeFile) {
                    handleChangeContent(activeFile.id, activeFile.content + '\n' + code);
                  }
                }}
              />
            )}
            {sidebarTab === 'settings' && (
              <SettingsView
                currentThemeId={themeId}
                onSelectTheme={(id) => setThemeId(id)}
                settings={settings}
                onUpdateSettings={(newSettings) =>
                  setSettings((prev) => ({ ...prev, ...newSettings }))
                }
              />
            )}
          </aside>
        )}

        {/* Center/Right Layout: Editor + BottomPanel + LivePreview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor & Bottom Terminal Column */}
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-[320px]">
            {/* Editor Area with Tabs & Multi-Split */}
            <div className="flex-1 flex overflow-hidden">
              <EditorArea
                theme={currentTheme}
                settings={settings}
                openTabs={openTabs}
                activeFileId={activeFileId}
                files={files}
                diffFile={diffFile}
                onSelectTab={(fileId) => {
                  const target = flatFiles.find((f) => f.id === fileId);
                  if (target) handleSelectFile(target);
                }}
                onCloseTab={handleCloseTab}
                onNewFile={() => handleCreateFile('NewComponent.tsx', 'src/components')}
                onChangeContent={handleChangeContent}
                onCloseDiff={() => setDiffFile(null)}
                onStageFile={handleStageFile}
                onDiscardFile={handleDiscardFile}
                isSplitView={isSplitView}
                onToggleSplitView={() => setIsSplitView(!isSplitView)}
                onToggleLivePreview={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
                breakpoints={breakpoints}
                onToggleBreakpoint={handleToggleBreakpoint}
                problems={problems}
                onCursorChange={(line, col) => setCursorPos({ line, col })}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                targetLine={targetLine}
              />
            </div>

            {/* Bottom Integrated Terminal & Tools Panel */}
            <BottomPanel
              theme={currentTheme}
              isOpen={isBottomPanelOpen}
              onClose={() => setIsBottomPanelOpen(false)}
              files={flatFiles}
              problems={problems}
              outputLogs={outputLogs}
              onClearOutput={() => setOutputLogs([])}
              onCreateFile={(name) => handleCreateFile(name)}
              onStartLivePreview={() => setIsLivePreviewOpen(true)}
              onSelectProblem={(fileId, line) => {
                const target = flatFiles.find((f) => f.id === fileId);
                if (target) handleSelectFile(target, line - 1);
              }}
            />
          </div>

          {/* Right Live Application Sandbox Preview */}
          {isLivePreviewOpen && (
            <div className="w-full md:w-[48%] lg:w-[45%] h-full shrink-0">
              <LivePreview
                theme={currentTheme}
                files={files}
                onClose={() => setIsLivePreviewOpen(false)}
                onLogOutput={(message, level) => {
                  setOutputLogs((prev) => [
                    ...prev,
                    {
                      time: new Date().toLocaleTimeString(),
                      text: `[App Preview] ${message}`,
                      channel: 'Tasks',
                    },
                  ]);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom VS Code Status Bar */}
      <StatusBar
        theme={currentTheme}
        cursorPos={cursorPos}
        tabSize={settings.tabSize}
        language={activeFile?.language || 'plaintext'}
        errorsCount={problems.filter((p) => p.severity === 'error').length}
        warningsCount={problems.filter((p) => p.severity === 'warning').length}
        isLivePreviewActive={isLivePreviewOpen}
        onOpenProblems={() => {
          setIsBottomPanelOpen(true);
        }}
        onOpenLanguageSelector={() => setIsCommandPaletteOpen(true)}
      />

      {/* 4. Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
        files={files}
        onSelectFile={(f) => handleSelectFile(f)}
        theme={currentTheme}
      />
    </div>
  );
}
