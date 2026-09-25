import React, { useState, useRef, useEffect } from 'react';
import { 
  Code2, 
  Search, 
  Columns, 
  PanelBottom, 
  PanelLeft, 
  Play, 
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';
import { ThemeConfig } from '../types';

interface TopMenuBarProps {
  theme: ThemeConfig;
  activeFileName?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isBottomPanelOpen: boolean;
  onToggleBottomPanel: () => void;
  isLivePreviewOpen: boolean;
  onToggleLivePreview: () => void;
  isSplitView: boolean;
  onToggleSplitView: () => void;
  onOpenCommandPalette: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onSaveFile: () => void;
  onFormatDocument: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({
  theme,
  activeFileName = 'App.tsx',
  isSidebarOpen,
  onToggleSidebar,
  isBottomPanelOpen,
  onToggleBottomPanel,
  isLivePreviewOpen,
  onToggleLivePreview,
  isSplitView,
  onToggleSplitView,
  onOpenCommandPalette,
  onNewFile,
  onNewFolder,
  onSaveFile,
  onFormatDocument,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus: Record<string, { label: string; shortcut?: string; action: () => void; divider?: boolean }[]> = {
    File: [
      { label: 'New Text File', shortcut: 'Ctrl+N', action: onNewFile },
      { label: 'New Folder', action: onNewFolder },
      { label: 'Save', shortcut: 'Ctrl+S', action: onSaveFile, divider: true },
      { label: 'Format Document', shortcut: 'Shift+Alt+F', action: onFormatDocument },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo'), divider: true },
      { label: 'Find in File', shortcut: 'Ctrl+F', action: () => onOpenCommandPalette() },
      { label: 'Format Document', shortcut: 'Shift+Alt+F', action: onFormatDocument },
    ],
    Selection: [
      { label: 'Select All', shortcut: 'Ctrl+A', action: () => document.execCommand('selectAll') },
      { label: 'Expand Selection', shortcut: 'Shift+Alt+Right', action: () => {} },
    ],
    View: [
      { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P', action: onOpenCommandPalette },
      { label: 'Toggle Primary Side Bar', shortcut: 'Ctrl+B', action: onToggleSidebar },
      { label: 'Toggle Terminal Panel', shortcut: 'Ctrl+`', action: onToggleBottomPanel, divider: true },
      { label: 'Split Editor Right', action: onToggleSplitView },
      { label: 'Toggle Live Web Preview', action: onToggleLivePreview },
    ],
    Run: [
      { label: 'Start Live Preview', shortcut: 'F5', action: onToggleLivePreview },
      { label: 'Run Active Script', shortcut: 'Ctrl+F5', action: onToggleBottomPanel },
    ],
    Terminal: [
      { label: 'New Terminal', shortcut: 'Ctrl+Shift+`', action: onToggleBottomPanel },
      { label: 'Run Build Task...', action: onToggleBottomPanel },
    ],
    Help: [
      { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', action: onOpenCommandPalette },
      { label: 'Documentation & Guides', action: () => window.open('https://code.visualstudio.com/docs', '_blank') },
      { label: 'About Studio Code', action: onOpenCommandPalette },
    ],
  };

  return (
    <header 
      style={{ 
        backgroundColor: theme.bgSidebar, 
        borderColor: theme.borderColor,
        color: theme.textPrimary 
      }}
      className="h-9 px-3 flex items-center justify-between border-b select-none text-xs shrink-0 z-30"
    >
      {/* Zone 1: Brand & Menus */}
      <div className="flex items-center gap-1.5" ref={menuRef}>
        <div className="flex items-center gap-1.5 mr-2">
          {/* Visual Studio Code icon styling */}
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[#007acc] text-white">
            <Code2 size={13} className="text-white" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-white/90 hidden sm:inline">
            Studio Code
          </span>
        </div>

        {/* Menu Items */}
        <nav className="flex items-center">
          {Object.keys(menus).map((menuName) => {
            const isOpen = activeMenu === menuName;
            return (
              <div key={menuName} className="relative">
                <button
                  onClick={() => setActiveMenu(isOpen ? null : menuName)}
                  onMouseEnter={() => activeMenu && setActiveMenu(menuName)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    isOpen 
                      ? 'bg-white/15 text-white' 
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {menuName}
                </button>

                {isOpen && (
                  <div 
                    style={{ 
                      backgroundColor: theme.bgSidebar,
                      borderColor: theme.borderColor 
                    }}
                    className="absolute left-0 top-full mt-1 w-56 rounded-md shadow-2xl border py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {menus[menuName].map((item, idx) => (
                      <React.Fragment key={idx}>
                        <button
                          onClick={() => {
                            item.action();
                            setActiveMenu(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#007acc] hover:text-white text-neutral-300 transition-colors"
                        >
                          <span>{item.label}</span>
                          {item.shortcut && (
                            <span className="text-[10px] text-neutral-400 opacity-80 font-mono ml-4">
                              {item.shortcut}
                            </span>
                          )}
                        </button>
                        {item.divider && (
                          <div 
                            style={{ borderColor: theme.borderColor }} 
                            className="my-1 border-t" 
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Zone 2: Command Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenCommandPalette}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: theme.borderColor 
          }}
          className="w-full h-6 px-3 rounded border text-xs flex items-center justify-between text-neutral-400 hover:text-neutral-200 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={12} className="shrink-0 text-neutral-400" />
            <span className="truncate">
              studio-code-workspace - <span className="text-neutral-300">{activeFileName}</span>
            </span>
          </div>
          <span className="text-[10px] bg-neutral-800/80 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700/60 font-mono shrink-0 ml-2">
            Ctrl+P
          </span>
        </button>
      </div>

      {/* Zone 3: Layout & Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleLivePreview}
          title="Toggle Live Web Preview"
          className={`h-6 px-2 rounded flex items-center gap-1 text-xs font-medium transition-colors ${
            isLivePreviewOpen 
              ? 'bg-[#007acc] text-white' 
              : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Play size={11} className={isLivePreviewOpen ? 'fill-white' : ''} />
          <span className="hidden md:inline">Preview</span>
        </button>

        <div className="w-[1px] h-3.5 bg-white/10 mx-1" />

        <button
          onClick={onToggleSplitView}
          title="Split Editor Right"
          className={`p-1.5 rounded transition-colors ${
            isSplitView ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Columns size={13} />
        </button>

        <button
          onClick={onToggleSidebar}
          title="Toggle Primary Side Bar (Ctrl+B)"
          className={`p-1.5 rounded transition-colors ${
            isSidebarOpen ? 'text-white' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <PanelLeft size={13} />
        </button>

        <button
          onClick={onToggleBottomPanel}
          title="Toggle Bottom Terminal Panel (Ctrl+`)"
          className={`p-1.5 rounded transition-colors ${
            isBottomPanelOpen ? 'text-white' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <PanelBottom size={13} />
        </button>
      </div>
    </header>
  );
};
