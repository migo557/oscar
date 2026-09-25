import React, { useState } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  PlayCircle, 
  Blocks, 
  Sparkles, 
  Settings, 
  User, 
  Sliders, 
  Palette, 
  Keyboard,
  Check
} from 'lucide-react';
import { SidebarTab, ThemeConfig } from '../types';

interface ActivityBarProps {
  theme: ThemeConfig;
  activeTab: SidebarTab | null;
  onSelectTab: (tab: SidebarTab) => void;
  uncommittedCount: number;
  onOpenThemeModal: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  theme,
  activeTab,
  onSelectTab,
  uncommittedCount,
  onOpenThemeModal,
  onOpenShortcuts,
  onOpenSettings,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const topItems: { id: SidebarTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'explorer',
      label: 'Explorer (Ctrl+Shift+E)',
      icon: <Files size={22} strokeWidth={1.5} />,
    },
    {
      id: 'search',
      label: 'Search (Ctrl+Shift+F)',
      icon: <Search size={22} strokeWidth={1.5} />,
    },
    {
      id: 'git',
      label: 'Source Control (Ctrl+Shift+G)',
      icon: <GitBranch size={22} strokeWidth={1.5} />,
      badge: uncommittedCount > 0 ? uncommittedCount : undefined,
    },
    {
      id: 'debug',
      label: 'Run and Debug (Ctrl+Shift+D)',
      icon: <PlayCircle size={22} strokeWidth={1.5} />,
    },
    {
      id: 'extensions',
      label: 'Extensions (Ctrl+Shift+X)',
      icon: <Blocks size={22} strokeWidth={1.5} />,
    },
    {
      id: 'ai',
      label: 'AI Studio Copilot',
      icon: <Sparkles size={22} strokeWidth={1.5} className="text-amber-400" />,
    },
  ];

  return (
    <aside
      style={{
        backgroundColor: theme.bgActivityBar,
        borderColor: theme.borderColor,
      }}
      className="w-12 h-full flex flex-col justify-between items-center py-2 select-none border-r shrink-0 z-20 relative"
    >
      {/* Top group: Views */}
      <div className="flex flex-col items-center gap-1 w-full">
        {topItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`relative w-full h-11 flex items-center justify-center transition-colors group ${
                isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div 
                  style={{ backgroundColor: theme.accent }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r" 
                />
              )}

              {item.icon}

              {/* Badge for Git or Notifications */}
              {item.badge !== undefined && (
                <span className="absolute bottom-1.5 right-2 min-w-[14px] h-[14px] px-1 text-[9px] font-bold bg-[#007acc] text-white rounded-full flex items-center justify-center leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom group: Profile & Settings */}
      <div className="flex flex-col items-center gap-1 w-full relative">
        <button
          onClick={() => {}}
          title="Accounts"
          className="w-full h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <User size={20} strokeWidth={1.5} />
        </button>

        <div className="relative w-full">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            title="Manage & Settings"
            className={`w-full h-10 flex items-center justify-center transition-colors ${
              showSettingsMenu ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>

          {showSettingsMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSettingsMenu(false)} 
              />
              <div
                style={{
                  backgroundColor: theme.bgSidebar,
                  borderColor: theme.borderColor,
                }}
                className="absolute left-full bottom-0 ml-2 w-52 rounded-md shadow-2xl border py-1.5 z-50 text-xs text-neutral-200 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#007acc] hover:text-white transition-colors"
                >
                  <Sliders size={14} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    onOpenThemeModal();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#007acc] hover:text-white transition-colors"
                >
                  <Palette size={14} />
                  <span>Themes & Colors</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    onOpenShortcuts();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#007acc] hover:text-white transition-colors"
                >
                  <Keyboard size={14} />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
