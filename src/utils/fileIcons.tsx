import React from 'react';
import { 
  FileCode, 
  FileText, 
  FileJson, 
  Folder, 
  FolderOpen, 
  Settings, 
  File, 
  Code,
  FileSpreadsheet,
  Terminal,
  Layers
} from 'lucide-react';

interface FileIconProps {
  name: string;
  isFolder?: boolean;
  isOpen?: boolean;
  className?: string;
  size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({ 
  name, 
  isFolder = false, 
  isOpen = false, 
  className = '', 
  size = 15 
}) => {
  if (isFolder) {
    if (isOpen) {
      return <FolderOpen size={size} className={`text-[#dcb67a] shrink-0 ${className}`} />;
    }
    return <Folder size={size} className={`text-[#dcb67a] shrink-0 ${className}`} />;
  }

  const lower = name.toLowerCase();

  // TypeScript / TSX
  if (lower.endsWith('.tsx')) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={`shrink-0 flex items-center justify-center font-bold text-[9px] rounded-[2px] bg-[#3178c6] text-white select-none ${className}`}
      >
        TX
      </div>
    );
  }
  if (lower.endsWith('.ts')) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={`shrink-0 flex items-center justify-center font-bold text-[9px] rounded-[2px] bg-[#3178c6] text-white select-none ${className}`}
      >
        TS
      </div>
    );
  }

  // JavaScript / JSX
  if (lower.endsWith('.jsx')) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={`shrink-0 flex items-center justify-center font-bold text-[9px] rounded-[2px] bg-[#f7df1e] text-black select-none ${className}`}
      >
        JX
      </div>
    );
  }
  if (lower.endsWith('.js') || lower.endsWith('.mjs')) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={`shrink-0 flex items-center justify-center font-bold text-[9px] rounded-[2px] bg-[#f7df1e] text-black select-none ${className}`}
      >
        JS
      </div>
    );
  }

  // HTML / CSS
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return <Code size={size} className={`text-[#e34c26] shrink-0 ${className}`} />;
  }
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.sass')) {
    return <Layers size={size} className={`text-[#42a5f5] shrink-0 ${className}`} />;
  }

  // JSON
  if (lower.endsWith('.json')) {
    return <FileJson size={size} className={`text-[#cbcb41] shrink-0 ${className}`} />;
  }

  // Markdown
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    return <FileText size={size} className={`text-[#519aba] shrink-0 ${className}`} />;
  }

  // Python
  if (lower.endsWith('.py')) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={`shrink-0 flex items-center justify-center font-bold text-[9px] rounded-[2px] bg-[#3572a5] text-[#ffd343] select-none ${className}`}
      >
        PY
      </div>
    );
  }

  // Shell / Config
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) {
    return <Terminal size={size} className={`text-[#4ebb2e] shrink-0 ${className}`} />;
  }
  if (lower.startsWith('.git') || lower.endsWith('.env') || lower.includes('config')) {
    return <Settings size={size} className={`text-[#858585] shrink-0 ${className}`} />;
  }

  return <FileCode size={size} className={`text-[#858585] shrink-0 ${className}`} />;
};
