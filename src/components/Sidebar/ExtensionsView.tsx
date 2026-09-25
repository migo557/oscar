import React, { useState } from 'react';
import { Search, Star, Download, Check, Settings, Trash2 } from 'lucide-react';
import { ExtensionItem, ThemeConfig } from '../../types';

interface ExtensionsViewProps {
  theme: ThemeConfig;
  extensions: ExtensionItem[];
  onToggleInstall: (id: string) => void;
}

export const ExtensionsView: React.FC<ExtensionsViewProps> = ({
  theme,
  extensions,
  onToggleInstall,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'installed'>('all');

  const filtered = extensions.filter((ext) => {
    const matchesSearch = 
      ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'installed') {
      return matchesSearch && ext.installed;
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="h-8 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide text-neutral-300 uppercase border-b border-white/5 shrink-0">
        <span>Extensions: Marketplace</span>
      </div>

      <div className="p-3 border-b border-white/5 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Extensions in Marketplace"
            className="w-full bg-[#1e1e1e] border border-neutral-700 focus:border-[#007acc] text-xs text-white pl-2 pr-8 py-1 outline-none"
          />
          <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#007acc] text-white font-medium'
                : 'text-neutral-400 hover:text-white bg-white/5'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('installed')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              activeFilter === 'installed'
                ? 'bg-[#007acc] text-white font-medium'
                : 'text-neutral-400 hover:text-white bg-white/5'
            }`}
          >
            Installed ({extensions.filter((e) => e.installed).length})
          </button>
        </div>
      </div>

      {/* Extension List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {filtered.map((ext) => (
          <div key={ext.id} className="p-3 hover:bg-white/5 flex gap-3 transition-colors">
            {/* Extension Icon */}
            <div
              style={{ backgroundColor: ext.iconBg }}
              className="w-10 h-10 rounded shrink-0 flex items-center justify-center font-bold text-white text-sm shadow-md"
            >
              {ext.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-white truncate text-xs">{ext.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">v{ext.version}</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                {ext.description}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1">
                <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                  <span className="text-neutral-400">{ext.publisher}</span>
                  <span className="flex items-center gap-0.5">
                    <Download size={10} />
                    {ext.downloads}
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star size={10} className="fill-amber-400" />
                    {ext.rating}
                  </span>
                </div>

                <button
                  onClick={() => onToggleInstall(ext.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    ext.installed
                      ? 'bg-neutral-800 hover:bg-red-950/60 hover:text-red-300 text-neutral-300 border border-neutral-700'
                      : 'bg-[#007acc] hover:bg-[#0062a3] text-white'
                  }`}
                >
                  {ext.installed ? 'Disable' : 'Install'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
