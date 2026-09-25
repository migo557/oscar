import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  X, 
  ChevronUp, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { WorkspaceFile, FileLanguage, ThemeConfig, EditorSettings, ProblemItem } from '../../types';
import { tokenizeLine, getTokenColor } from '../../utils/syntax';
import { Minimap } from './Minimap';
import { IntelliSensePopup, SuggestionItem } from './IntelliSensePopup';

interface CodeEditorProps {
  file: WorkspaceFile;
  theme: ThemeConfig;
  settings: EditorSettings;
  problems?: ProblemItem[];
  breakpoints: number[];
  onToggleBreakpoint: (line: number) => void;
  onChangeContent: (newContent: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  initialLine?: number;
}

const COMMON_SUGGESTIONS: SuggestionItem[] = [
  { label: 'useState', kind: 'function', detail: 'React hook for reactive component state', insertText: 'const [state, setState] = useState();' },
  { label: 'useEffect', kind: 'function', detail: 'React hook for side effects and lifecycles', insertText: 'useEffect(() => {\n  \n  return () => {};\n}, []);' },
  { label: 'useRef', kind: 'function', detail: 'Mutable ref object that persists across renders', insertText: 'const ref = useRef(null);' },
  { label: 'useMemo', kind: 'function', detail: 'Memoized computed calculation value', insertText: 'const memoized = useMemo(() => computation(), []);' },
  { label: 'React.FC', kind: 'type', detail: 'TypeScript type for React Functional Component', insertText: 'React.FC' },
  { label: 'clamp', kind: 'function', detail: 'math.ts: Clamp value between min and max', insertText: 'clamp(val, min, max)' },
  { label: 'randomRange', kind: 'function', detail: 'math.ts: Generate random number between min and max', insertText: 'randomRange(min, max)' },
  { label: 'console.log', kind: 'function', detail: 'Print output to dev console', insertText: 'console.log();' },
  { label: 'import', kind: 'keyword', detail: 'Import external modules or types', insertText: 'import  from \'\';' },
  { label: 'export', kind: 'keyword', detail: 'Export module members', insertText: 'export ' },
  { label: 'interface', kind: 'keyword', detail: 'TypeScript interface declaration', insertText: 'interface IProps {\n  \n}' },
  { label: 'type', kind: 'keyword', detail: 'TypeScript type alias', insertText: 'type TState = ' },
  { label: 'async/await', kind: 'snippet', detail: 'Async function snippet', insertText: 'async function fetchData() {\n  const res = await fetch();\n}' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  theme,
  settings,
  problems = [],
  breakpoints,
  onToggleBreakpoint,
  onChangeContent,
  onCursorChange,
  initialLine,
}) => {
  const [content, setContent] = useState(file.content);
  const [cursorLine, setCursorLine] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [foldedLines, setFoldedLines] = useState<Record<number, boolean>>({});

  // Find in file
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findMatchIndex, setFindMatchIndex] = useState(0);

  // IntelliSense
  const [showIntelliSense, setShowIntelliSense] = useState(false);
  const [intelliSensePos, setIntelliSensePos] = useState({ top: 0, left: 0 });
  const [intelliSenseIndex, setIntelliSenseIndex] = useState(0);
  const [intelliSenseWord, setIntelliSenseWord] = useState('');

  // Scroll sync
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const codeContainerRef = useRef<HTMLDivElement | null>(null);

  // Keep internal content in sync when file changes
  useEffect(() => {
    setContent(file.content);
  }, [file.id, file.content]);

  // Handle jump to line if requested
  useEffect(() => {
    if (initialLine !== undefined && textareaRef.current) {
      const lines = file.content.split('\n');
      let charPos = 0;
      for (let i = 0; i < Math.min(initialLine, lines.length); i++) {
        charPos += lines[i].length + 1;
      }
      textareaRef.current.setSelectionRange(charPos, charPos);
      textareaRef.current.focus();
      const lineTop = initialLine * (settings.fontSize * 1.5);
      if (textareaRef.current) textareaRef.current.scrollTop = Math.max(0, lineTop - 100);
    }
  }, [initialLine, file.id]);

  const lines = useMemo(() => content.split('\n'), [content]);

  // Compute search matches
  const findMatches = useMemo(() => {
    if (!findQuery.trim()) return [];
    const matches: { line: number; col: number; len: number }[] = [];
    lines.forEach((line, lIdx) => {
      let startIndex = 0;
      const lowerLine = line.toLowerCase();
      const lowerQuery = findQuery.toLowerCase();
      while ((startIndex = lowerLine.indexOf(lowerQuery, startIndex)) !== -1) {
        matches.push({ line: lIdx, col: startIndex, len: findQuery.length });
        startIndex += lowerQuery.length;
      }
    });
    return matches;
  }, [lines, findQuery]);

  const handleTextareaScroll = () => {
    if (textareaRef.current) {
      setScrollTop(textareaRef.current.scrollTop);
      setViewportHeight(textareaRef.current.clientHeight);
      if (codeContainerRef.current) {
        codeContainerRef.current.scrollTop = textareaRef.current.scrollTop;
        codeContainerRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    }
  };

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const selStart = textareaRef.current.selectionStart;
    const textBefore = content.slice(0, selStart);
    const lineArr = textBefore.split('\n');
    const currentLine = lineArr.length - 1;
    const currentCol = lineArr[lineArr.length - 1].length;

    setCursorLine(currentLine);
    setCursorCol(currentCol);
    if (onCursorChange) {
      onCursorChange(currentLine + 1, currentCol + 1);
    }

    // Check last word for autocomplete
    const match = textBefore.match(/([a-zA-Z0-9_$]+)$/);
    if (match && match[1].length >= 2) {
      const word = match[1];
      setIntelliSenseWord(word);
      const lineHeight = settings.fontSize * 1.5;
      const top = Math.min(window.innerHeight - 220, (currentLine + 1) * lineHeight - (textareaRef.current?.scrollTop || 0) + 70);
      const left = Math.min(window.innerWidth - 300, currentCol * (settings.fontSize * 0.6) + 80);
      setIntelliSensePos({ top, left });
      setShowIntelliSense(true);
    } else {
      setShowIntelliSense(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IntelliSense navigation
    if (showIntelliSense && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIntelliSenseIndex((prev) => (prev + 1) % filteredSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIntelliSenseIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(filteredSuggestions[intelliSenseIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowIntelliSense(false);
        return;
      }
    }

    // Tab key: Indent with spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const spaces = ' '.repeat(settings.tabSize);
      const newText = content.substring(0, start) + spaces + content.substring(end);
      setContent(newText);
      onChangeContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + settings.tabSize;
          updateCursorPosition();
        }
      }, 0);
      return;
    }

    // Find Shortcut Ctrl+F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setIsFindOpen(true);
      return;
    }

    // Ctrl+Space: manual IntelliSense trigger
    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      setIntelliSenseWord('');
      const lineHeight = settings.fontSize * 1.5;
      const top = (cursorLine + 1) * lineHeight - (textareaRef.current?.scrollTop || 0) + 70;
      const left = cursorCol * (settings.fontSize * 0.6) + 80;
      setIntelliSensePos({ top, left });
      setShowIntelliSense(true);
      return;
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!intelliSenseWord) return COMMON_SUGGESTIONS;
    return COMMON_SUGGESTIONS.filter((s) =>
      s.label.toLowerCase().includes(intelliSenseWord.toLowerCase())
    );
  }, [intelliSenseWord]);

  const insertSuggestion = (item: SuggestionItem) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const wordLen = intelliSenseWord.length;
    const newContent = 
      content.substring(0, start - wordLen) + 
      item.insertText + 
      content.substring(start);

    setContent(newContent);
    onChangeContent(newContent);
    setShowIntelliSense(false);
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = start - wordLen + item.insertText.length;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
        textareaRef.current.focus();
        updateCursorPosition();
      }
    }, 0);
  };

  const handleMinimapScroll = (ratio: number) => {
    if (textareaRef.current) {
      const targetScroll = ratio * (lines.length * settings.fontSize * 1.5);
      textareaRef.current.scrollTop = targetScroll;
    }
  };

  const toggleFold = (lineIndex: number) => {
    setFoldedLines((prev) => ({
      ...prev,
      [lineIndex]: !prev[lineIndex],
    }));
  };

  const totalEditorHeight = lines.length * (settings.fontSize * 1.5);

  return (
    <div 
      style={{ backgroundColor: theme.bgMain, color: theme.textPrimary }}
      className="flex-1 flex h-full relative overflow-hidden select-none font-mono"
    >
      {/* Find in File Widget */}
      {isFindOpen && (
        <div 
          style={{ backgroundColor: theme.bgSidebar, borderColor: theme.borderColor }}
          className="absolute right-20 top-2 z-40 p-2 rounded shadow-2xl border flex items-center gap-2 text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center bg-[#1e1e1e] border border-neutral-700 px-2 py-1 rounded">
            <Search size={13} className="text-neutral-400 mr-1.5" />
            <input
              type="text"
              autoFocus
              value={findQuery}
              onChange={(e) => {
                setFindQuery(e.target.value);
                setFindMatchIndex(0);
              }}
              placeholder="Find in file"
              className="bg-transparent text-white outline-none w-36 text-xs font-mono"
            />
            <span className="text-[10px] text-neutral-500 font-mono ml-2">
              {findMatches.length > 0 ? `${findMatchIndex + 1}/${findMatches.length}` : 'No results'}
            </span>
          </div>

          <button
            onClick={() => {
              if (findMatches.length > 0) {
                setFindMatchIndex((prev) => (prev - 1 + findMatches.length) % findMatches.length);
              }
            }}
            disabled={findMatches.length === 0}
            className="p-1 hover:text-white disabled:opacity-30 text-neutral-400"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => {
              if (findMatches.length > 0) {
                setFindMatchIndex((prev) => (prev + 1) % findMatches.length);
              }
            }}
            disabled={findMatches.length === 0}
            className="p-1 hover:text-white disabled:opacity-30 text-neutral-400"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setIsFindOpen(false)}
            className="p-1 hover:text-white text-neutral-400"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex h-full relative overflow-hidden">
        {/* Line Gutter */}
        {settings.lineNumbers && (
          <div
            style={{
              width: '54px',
              backgroundColor: theme.bgMain,
              borderColor: theme.borderColor,
            }}
            className="h-full flex flex-col shrink-0 select-none py-2 text-right pr-3 border-r z-10"
          >
            {lines.map((_, idx) => {
              const lineNum = idx + 1;
              const hasBreakpoint = breakpoints.includes(lineNum);
              const isCurrent = cursorLine === idx;
              const canFold = lines[idx].includes('{') || lines[idx].includes('(');

              return (
                <div
                  key={idx}
                  style={{ height: `${settings.fontSize * 1.5}px`, fontSize: `${settings.fontSize}px` }}
                  className="flex items-center justify-end relative group cursor-pointer"
                  onClick={() => onToggleBreakpoint(lineNum)}
                >
                  {/* Breakpoint Red Dot */}
                  <span
                    className={`absolute left-2 w-2.5 h-2.5 rounded-full transition-transform ${
                      hasBreakpoint
                        ? 'bg-[#e51400] scale-100 shadow-sm'
                        : 'bg-[#e51400]/40 scale-0 group-hover:scale-75'
                    }`}
                  />

                  {/* Fold arrow toggle */}
                  {canFold && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFold(idx);
                      }}
                      className="absolute right-8 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
                    >
                      {foldedLines[idx] ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                    </button>
                  )}

                  {/* Line Number */}
                  <span
                    className={`font-mono text-xs ${
                      isCurrent ? 'text-neutral-100 font-bold' : 'text-neutral-600'
                    }`}
                  >
                    {lineNum}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Code & Overlay Editor Container */}
        <div className="flex-1 relative h-full overflow-hidden">
          {/* Active Line Highlight Background Band */}
          <div
            style={{
              position: 'absolute',
              top: `${cursorLine * (settings.fontSize * 1.5) + 8 - scrollTop}px`,
              left: 0,
              right: 0,
              height: `${settings.fontSize * 1.5}px`,
              backgroundColor: theme.lineHighlight,
            }}
            className="pointer-events-none z-0"
          />

          {/* Syntax Highlighted Render Layer */}
          <div
            ref={codeContainerRef}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: `${settings.fontSize * 1.5}px`,
            }}
            className="absolute inset-0 p-2 overflow-hidden pointer-events-none select-none z-0 whitespace-pre"
          >
            {lines.map((line, idx) => {
              const tokens = tokenizeLine(line, file.language);
              const lineProblems = problems.filter((p) => p.line === idx + 1);

              return (
                <div
                  key={idx}
                  style={{ height: `${settings.fontSize * 1.5}px` }}
                  className="flex items-center relative"
                >
                  {tokens.map((token, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        color: getTokenColor(token.type, theme.type === 'light'),
                      }}
                    >
                      {token.text}
                    </span>
                  ))}

                  {/* Red squiggly underline for problems */}
                  {lineProblems.length > 0 && (
                    <span
                      title={lineProblems[0].message}
                      className="absolute left-0 bottom-0 right-0 h-[2px] bg-red-500/80 border-b border-dotted border-red-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Transparent Input Textarea Overlay for Full Typing & Selection */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onChangeContent(e.target.value);
              updateCursorPosition();
            }}
            onScroll={handleTextareaScroll}
            onSelect={updateCursorPosition}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onKeyDown={handleKeyDown}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: `${settings.fontSize * 1.5}px`,
              tabSize: settings.tabSize,
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="absolute inset-0 p-2 bg-transparent text-transparent caret-white outline-none resize-none font-mono whitespace-pre z-10 overflow-auto"
          />
        </div>

        {/* Minimap */}
        {settings.minimap && (
          <Minimap
            lines={lines}
            language={file.language}
            theme={theme}
            scrollTop={scrollTop}
            viewportHeight={viewportHeight}
            totalHeight={totalEditorHeight}
            onScrollTo={handleMinimapScroll}
          />
        )}
      </div>

      {/* Autocomplete IntelliSense Popup */}
      {showIntelliSense && (
        <IntelliSensePopup
          suggestions={filteredSuggestions}
          selectedIndex={intelliSenseIndex}
          onSelect={insertSuggestion}
          position={intelliSensePos}
        />
      )}
    </div>
  );
};
