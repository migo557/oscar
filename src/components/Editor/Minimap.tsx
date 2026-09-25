import React, { useRef, useEffect } from 'react';
import { tokenizeLine, getTokenColor } from '../../utils/syntax';
import { FileLanguage, ThemeConfig } from '../../types';

interface MinimapProps {
  lines: string[];
  language: FileLanguage;
  theme: ThemeConfig;
  scrollTop: number;
  viewportHeight: number;
  totalHeight: number;
  onScrollTo: (scrollTopRatio: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  lines,
  language,
  theme,
  scrollTop,
  viewportHeight,
  totalHeight,
  onScrollTo,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollRatio = totalHeight > 0 ? scrollTop / totalHeight : 0;
  const viewportRatio = totalHeight > 0 ? Math.min(1, viewportHeight / totalHeight) : 1;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, clickY / rect.height));
    onScrollTo(ratio);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        width: '68px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderLeft: `1px solid ${theme.borderColor}`,
      }}
      className="h-full relative overflow-hidden select-none cursor-pointer shrink-0 hidden lg:block"
    >
      {/* Code representation */}
      <div className="w-full py-1 px-1 flex flex-col pointer-events-none">
        {lines.slice(0, 150).map((line, idx) => {
          const tokens = tokenizeLine(line, language);
          return (
            <div key={idx} className="h-[2px] mb-[1px] flex items-center overflow-hidden">
              {tokens.map((tok, tIdx) => {
                const color = getTokenColor(tok.type, theme.type === 'light');
                const width = Math.min(60, tok.text.trim().length * 1.5);
                if (width <= 0) return <span key={tIdx} style={{ width: '4px' }} />;
                return (
                  <span
                    key={tIdx}
                    style={{
                      width: `${width}px`,
                      backgroundColor: color,
                      opacity: 0.65,
                    }}
                    className="h-[1.5px] rounded-xs mr-[1px] shrink-0"
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Viewport Slider Box */}
      <div
        style={{
          top: `${scrollRatio * 100}%`,
          height: `${Math.max(15, viewportRatio * 100)}%`,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
        className="absolute left-0 right-0 border-y pointer-events-none"
      />
    </div>
  );
};
