import React from 'react';
import { Palette, Type, Sliders, Check, Eye, WrapText } from 'lucide-react';
import { ThemeId, ThemeConfig, EditorSettings } from '../../types';
import { THEMES } from '../../data/workspaceData';

interface SettingsViewProps {
  currentThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentThemeId,
  onSelectTheme,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="h-8 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide text-neutral-300 uppercase border-b border-white/5 shrink-0">
        <span>Settings & Preferences</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Color Theme */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-neutral-200 font-semibold text-xs">
            <Palette size={14} className="text-[#007acc]" />
            <span>Color Theme</span>
          </div>

          <div className="space-y-1">
            {Object.values(THEMES).map((theme) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`w-full px-3 py-2 rounded flex items-center justify-between border transition-all text-xs ${
                    isSelected
                      ? 'border-[#007acc] bg-[#007acc]/10 text-white font-medium'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      style={{ backgroundColor: theme.bgMain }} 
                      className="w-3.5 h-3.5 rounded border border-white/20" 
                    />
                    <span>{theme.name}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-[#007acc]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-neutral-200 font-semibold text-xs">
            <div className="flex items-center gap-1.5">
              <Type size={14} className="text-[#007acc]" />
              <span>Editor: Font Size</span>
            </div>
            <span className="font-mono text-neutral-400">{settings.fontSize}px</span>
          </div>

          <input
            type="range"
            min="11"
            max="20"
            value={settings.fontSize}
            onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-[#007acc] cursor-pointer"
          />
        </div>

        {/* Tab Size */}
        <div className="space-y-2">
          <div className="text-neutral-200 font-semibold text-xs">Editor: Tab Size</div>
          <div className="flex gap-2">
            {[2, 4].map((size) => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ tabSize: size })}
                className={`flex-1 py-1.5 rounded border text-xs font-mono transition-colors ${
                  settings.tabSize === size
                    ? 'border-[#007acc] bg-[#007acc]/20 text-white'
                    : 'border-neutral-700 hover:border-neutral-600 text-neutral-400'
                }`}
              >
                {size} Spaces
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="text-neutral-300">Editor: Minimap Enabled</div>
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => onUpdateSettings({ minimap: e.target.checked })}
              className="accent-[#007acc] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-neutral-300">Editor: Word Wrap</div>
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
              className="accent-[#007acc] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-neutral-300">Editor: Line Numbers</div>
            <input
              type="checkbox"
              checked={settings.lineNumbers}
              onChange={(e) => onUpdateSettings({ lineNumbers: e.target.checked })}
              className="accent-[#007acc] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-neutral-300">Editor: Format On Save</div>
            <input
              type="checkbox"
              checked={settings.formatOnSave}
              onChange={(e) => onUpdateSettings({ formatOnSave: e.target.checked })}
              className="accent-[#007acc] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-neutral-300">Files: Auto Save</div>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => onUpdateSettings({ autoSave: e.target.checked })}
              className="accent-[#007acc] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
