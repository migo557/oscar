import React from 'react';
import { Box, Code2, Variable, Sparkles, Hash, Braces } from 'lucide-react';

export interface SuggestionItem {
  label: string;
  kind: 'keyword' | 'function' | 'variable' | 'type' | 'snippet';
  detail: string;
  insertText: string;
}

interface IntelliSensePopupProps {
  suggestions: SuggestionItem[];
  selectedIndex: number;
  onSelect: (item: SuggestionItem) => void;
  position: { top: number; left: number };
}

export const IntelliSensePopup: React.FC<IntelliSensePopupProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
  position,
}) => {
  if (suggestions.length === 0) return null;

  const getKindIcon = (kind: SuggestionItem['kind']) => {
    switch (kind) {
      case 'keyword': return <Hash size={13} className="text-[#c586c0]" />;
      case 'function': return <Code2 size={13} className="text-[#dcdcaa]" />;
      case 'variable': return <Variable size={13} className="text-[#9cdcfe]" />;
      case 'type': return <Box size={13} className="text-[#4ec9b0]" />;
      case 'snippet': return <Sparkles size={13} className="text-amber-400" />;
    }
  };

  const selectedItem = suggestions[selectedIndex] || suggestions[0];

  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-50 flex shadow-2xl rounded border border-neutral-700 bg-[#252526] text-xs font-mono select-none overflow-hidden max-w-lg"
    >
      {/* Suggestions List */}
      <div className="w-56 max-h-52 overflow-y-auto divide-y divide-white/5 py-1">
        {suggestions.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={idx}
              onClick={() => onSelect(item)}
              className={`px-2.5 py-1 flex items-center justify-between cursor-pointer transition-colors ${
                isSelected ? 'bg-[#04395e] text-white' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {getKindIcon(item.kind)}
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans ml-2 shrink-0">
                {item.kind}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail Pane */}
      {selectedItem && (
        <div className="w-48 bg-[#1e1e1e] p-2.5 border-l border-neutral-700 text-[11px] text-neutral-300 font-sans flex flex-col justify-between">
          <div>
            <div className="font-semibold text-white font-mono mb-1">{selectedItem.label}</div>
            <div className="text-neutral-400 leading-snug">{selectedItem.detail}</div>
          </div>
          <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
            Press <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">Tab</kbd> or <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">Enter</kbd> to insert
          </div>
        </div>
      )}
    </div>
  );
};
