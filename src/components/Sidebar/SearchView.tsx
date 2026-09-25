import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Replace, 
  ChevronRight, 
  ChevronDown, 
  CaseSensitive, 
  WholeWord, 
  Regex,
  RefreshCw
} from 'lucide-react';
import { WorkspaceFile, ThemeConfig } from '../../types';
import { FileIcon } from '../../utils/fileIcons';

interface SearchViewProps {
  theme: ThemeConfig;
  files: WorkspaceFile[];
  onSelectResult: (file: WorkspaceFile, lineIndex: number) => void;
  onReplaceAll: (searchTerm: string, replaceTerm: string) => void;
}

interface SearchMatch {
  file: WorkspaceFile;
  matches: {
    lineIndex: number;
    lineText: string;
    colIndex: number;
  }[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  theme,
  files,
  onSelectResult,
  onReplaceAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});

  // Helper to extract all flat files
  const flatFiles = useMemo(() => {
    const list: WorkspaceFile[] = [];
    const traverse = (items: WorkspaceFile[]) => {
      items.forEach((item) => {
        if (!item.isFolder) {
          list.push(item);
        } else if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(files);
    return list;
  }, [files]);

  // Compute search matches
  const searchResults: SearchMatch[] = useMemo(() => {
    if (!searchTerm.trim()) return [];

    let regex: RegExp;
    try {
      let pattern = searchTerm;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (matchWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      return [];
    }

    const results: SearchMatch[] = [];

    flatFiles.forEach((file) => {
      const lines = file.content.split('\n');
      const fileMatches: { lineIndex: number; lineText: string; colIndex: number }[] = [];

      lines.forEach((line, idx) => {
        regex.lastIndex = 0;
        const match = regex.exec(line);
        if (match) {
          fileMatches.push({
            lineIndex: idx,
            lineText: line.trim(),
            colIndex: match.index,
          });
        }
      });

      if (fileMatches.length > 0) {
        results.push({ file, matches: fileMatches });
      }
    });

    return results;
  }, [searchTerm, flatFiles, matchCase, matchWholeWord, useRegex]);

  const totalMatches = useMemo(() => {
    return searchResults.reduce((acc, curr) => acc + curr.matches.length, 0);
  }, [searchResults]);

  const toggleFile = (fileId: string) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [fileId]: !(prev[fileId] ?? true),
    }));
  };

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="h-8 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide text-neutral-300 uppercase border-b border-white/5 shrink-0">
        <span>Search</span>
      </div>

      <div className="p-3 space-y-2 border-b border-white/5">
        {/* Search Input Box */}
        <div className="relative flex items-center">
          <button
            onClick={() => setIsReplaceOpen(!isReplaceOpen)}
            className="p-1 text-neutral-400 hover:text-white mr-1"
          >
            {isReplaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#1e1e1e] border border-neutral-700 focus:border-[#007acc] text-xs text-white pl-2 pr-20 py-1 outline-none"
            />
            {/* Options icons */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-neutral-400">
              <button
                onClick={() => setMatchCase(!matchCase)}
                title="Match Case (Alt+C)"
                className={`p-0.5 rounded ${matchCase ? 'bg-[#007acc] text-white' : 'hover:text-white'}`}
              >
                <CaseSensitive size={13} />
              </button>
              <button
                onClick={() => setMatchWholeWord(!matchWholeWord)}
                title="Match Whole Word (Alt+W)"
                className={`p-0.5 rounded ${matchWholeWord ? 'bg-[#007acc] text-white' : 'hover:text-white'}`}
              >
                <WholeWord size={13} />
              </button>
              <button
                onClick={() => setUseRegex(!useRegex)}
                title="Use Regular Expression (Alt+R)"
                className={`p-0.5 rounded ${useRegex ? 'bg-[#007acc] text-white' : 'hover:text-white'}`}
              >
                <Regex size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Replace Input Box */}
        {isReplaceOpen && (
          <div className="flex items-center pl-6 gap-1">
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Replace"
              className="flex-1 bg-[#1e1e1e] border border-neutral-700 focus:border-[#007acc] text-xs text-white px-2 py-1 outline-none"
            />
            <button
              onClick={() => onReplaceAll(searchTerm, replaceTerm)}
              disabled={!searchTerm || totalMatches === 0}
              title="Replace All"
              className="px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-neutral-300 rounded text-xs shrink-0"
            >
              <Replace size={13} />
            </button>
          </div>
        )}

        {/* Summary info */}
        {searchTerm && (
          <div className="text-[11px] text-neutral-400 pt-1">
            {totalMatches} result{totalMatches === 1 ? '' : 's'} in {searchResults.length} file{searchResults.length === 1 ? '' : 's'}
          </div>
        )}
      </div>

      {/* Results Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {searchResults.map(({ file, matches }) => {
          const isOpen = expandedFiles[file.id] ?? true;
          return (
            <div key={file.id} className="flex flex-col">
              <button
                onClick={() => toggleFile(file.id)}
                className="h-6 px-3 flex items-center gap-1.5 hover:bg-white/5 text-xs text-neutral-300 w-full text-left"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <FileIcon name={file.name} size={14} />
                <span className="font-medium text-white truncate">{file.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">({matches.length})</span>
                <span className="text-[10px] text-neutral-500 truncate ml-auto">{file.path}</span>
              </button>

              {isOpen && (
                <div className="pl-6">
                  {matches.map((match, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectResult(file, match.lineIndex)}
                      className="h-6 px-3 flex items-center gap-2 hover:bg-white/10 cursor-pointer text-[11px] text-neutral-400 hover:text-white font-mono truncate"
                    >
                      <span className="text-neutral-500 w-6 text-right shrink-0">
                        {match.lineIndex + 1}
                      </span>
                      <span className="truncate">{match.lineText}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
