import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, File, Settings, Palette, Terminal, Sparkles, Check } from 'lucide-react';
import { CommandItem, WorkspaceFile, ThemeConfig } from '../types';
import { FileIcon } from '../utils/fileIcons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
  files: WorkspaceFile[];
  onSelectFile: (file: WorkspaceFile) => void;
  theme: ThemeConfig;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  files,
  onSelectFile,
  theme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Extract flat files for quick open
  const flatFiles = React.useMemo(() => {
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

  // Determine mode: if query starts with ">" it's command mode; otherwise file mode
  const isCommandMode = query.startsWith('>');
  const cleanQuery = query.startsWith('>') ? query.slice(1).trim() : query.trim();

  const filteredItems = React.useMemo(() => {
    if (isCommandMode) {
      if (!cleanQuery) return commands;
      return commands.filter((cmd) =>
        cmd.title.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        (cmd.category && cmd.category.toLowerCase().includes(cleanQuery.toLowerCase()))
      );
    } else {
      if (!cleanQuery) return flatFiles;
      return flatFiles.filter((f) =>
        f.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        f.path.toLowerCase().includes(cleanQuery.toLowerCase())
      );
    }
  }, [isCommandMode, cleanQuery, commands, flatFiles]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        if (isCommandMode) {
          (current as CommandItem).action();
        } else {
          onSelectFile(current as WorkspaceFile);
        }
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-100">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div
        style={{
          backgroundColor: theme.bgSidebar,
          borderColor: theme.borderColor,
        }}
        className="relative w-full max-w-xl rounded-lg shadow-2xl border overflow-hidden flex flex-col z-10"
      >
        {/* Search Header */}
        <div 
          style={{ borderColor: theme.borderColor }}
          className="p-3 border-b flex items-center gap-2 bg-[#1e1e1e]"
        >
          <Search size={15} className="text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type '>' to run commands, or type file name..."
            className="w-full bg-transparent text-white outline-none border-none text-xs font-mono caret-white"
          />
          <span className="text-[10px] text-neutral-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5 p-1">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-xs font-sans">
              No matching {isCommandMode ? 'commands' : 'files'} found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              if (isCommandMode) {
                const cmd = item as CommandItem;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-3 py-2 flex items-center justify-between text-xs cursor-pointer rounded transition-colors ${
                      isSelected ? 'bg-[#007acc] text-white' : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Command size={14} className={isSelected ? 'text-white' : 'text-neutral-400'} />
                      <div className="truncate">
                        {cmd.category && (
                          <span className={isSelected ? 'text-white/80' : 'text-neutral-400'}>
                            {cmd.category}:{' '}
                          </span>
                        )}
                        <span className="font-medium">{cmd.title}</span>
                      </div>
                    </div>

                    {cmd.shortcut && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-4 shrink-0 ${
                        isSelected ? 'bg-black/20 text-white' : 'bg-white/5 text-neutral-400'
                      }`}>
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                );
              }

              // File item
              const file = item as WorkspaceFile;
              return (
                <div
                  key={file.id}
                  onClick={() => {
                    onSelectFile(file);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 flex items-center justify-between text-xs cursor-pointer rounded transition-colors ${
                    isSelected ? 'bg-[#007acc] text-white' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileIcon name={file.name} size={14} />
                    <span className="font-medium truncate">{file.name}</span>
                    <span className={`text-[10px] truncate ${
                      isSelected ? 'text-white/70' : 'text-neutral-500'
                    }`}>
                      {file.path}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
