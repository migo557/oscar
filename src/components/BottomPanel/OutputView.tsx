import React, { useState } from 'react';
import { Trash2, Filter } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface OutputViewProps {
  theme: ThemeConfig;
  logs: { time: string; text: string; channel: string }[];
  onClear: () => void;
}

export const OutputView: React.FC<OutputViewProps> = ({
  theme,
  logs,
  onClear,
}) => {
  const [selectedChannel, setSelectedChannel] = useState('Tasks');

  const filteredLogs = logs.filter((l) => l.channel === selectedChannel || selectedChannel === 'All');

  return (
    <div className="flex-1 flex flex-col h-full font-mono text-xs overflow-hidden select-text">
      {/* Channel Bar */}
      <div 
        style={{ borderColor: theme.borderColor }}
        className="h-7 px-3 flex items-center justify-between border-b shrink-0 text-[11px] font-sans text-neutral-400"
      >
        <div className="flex items-center gap-2">
          <span>Channel:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="bg-[#1e1e1e] border border-neutral-700 text-neutral-200 px-2 py-0.5 rounded outline-none"
          >
            <option>Tasks</option>
            <option>Extension Host</option>
            <option>TypeScript Language Server</option>
            <option>All</option>
          </select>
        </div>

        <button
          onClick={onClear}
          title="Clear Output"
          className="hover:text-white p-1"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-1 text-neutral-300">
        {filteredLogs.length === 0 ? (
          <div className="text-neutral-500">No output logs recorded on channel '{selectedChannel}'.</div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-neutral-500 shrink-0">[{log.time}]</span>
              <span className="text-indigo-400 shrink-0">[{log.channel}]</span>
              <span className="text-neutral-200">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
