import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  FilePlus, 
  FolderPlus, 
  RefreshCw, 
  Minimize2, 
  MoreHorizontal,
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import { WorkspaceFile, TabItem, ThemeConfig } from '../../types';
import { FileIcon } from '../../utils/fileIcons';

interface ExplorerViewProps {
  theme: ThemeConfig;
  files: WorkspaceFile[];
  openTabs: TabItem[];
  activeFileId: string | null;
  onSelectFile: (file: WorkspaceFile) => void;
  onCloseTab: (tabId: string) => void;
  onCreateFile: (name: string, parentPath?: string) => void;
  onCreateFolder: (name: string, parentPath?: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  theme,
  files,
  openTabs,
  activeFileId,
  onSelectFile,
  onCloseTab,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
}) => {
  const [isOpenEditorsOpen, setIsOpenEditorsOpen] = useState(true);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/components': true,
    'src/utils': true,
  });

  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [targetParentPath, setTargetParentPath] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');

  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleStartCreate = (type: 'file' | 'folder', parentPath = '') => {
    setCreatingType(type);
    setTargetParentPath(parentPath);
    setNewItemName('');
  };

  const handleCommitCreate = () => {
    if (!newItemName.trim()) {
      setCreatingType(null);
      return;
    }
    if (creatingType === 'file') {
      onCreateFile(newItemName.trim(), targetParentPath);
    } else if (creatingType === 'folder') {
      onCreateFolder(newItemName.trim(), targetParentPath);
    }
    setCreatingType(null);
    setNewItemName('');
  };

  const handleCommitRename = (fileId: string) => {
    if (editingName.trim()) {
      onRenameFile(fileId, editingName.trim());
    }
    setEditingFileId(null);
  };

  // Render tree recursively
  const renderTree = (items: WorkspaceFile[], depth = 0) => {
    return items.map((item) => {
      const isExpanded = expandedFolders[item.path] ?? false;
      const isActive = activeFileId === item.id;
      const isEditing = editingFileId === item.id;

      if (item.isFolder) {
        return (
          <div key={item.id} className="flex flex-col">
            <div
              onClick={() => toggleFolder(item.path)}
              style={{ paddingLeft: `${depth * 14 + 10}px` }}
              className="h-6 flex items-center justify-between pr-2 text-xs cursor-pointer hover:bg-white/5 group text-neutral-300"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-neutral-400">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <FileIcon name={item.name} isFolder={true} isOpen={isExpanded} size={14} />
                <span className="font-medium truncate text-neutral-300 group-hover:text-white">
                  {item.name}
                </span>
              </div>

              {/* Quick actions for folder */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-neutral-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(item.path);
                    handleStartCreate('file', item.path);
                  }}
                  title="New File inside"
                  className="hover:text-white p-0.5"
                >
                  <FilePlus size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(item.path);
                    handleStartCreate('folder', item.path);
                  }}
                  title="New Folder inside"
                  className="hover:text-white p-0.5"
                >
                  <FolderPlus size={12} />
                </button>
              </div>
            </div>

            {/* Folder creation input */}
            {creatingType && targetParentPath === item.path && (
              <div
                style={{ paddingLeft: `${(depth + 1) * 14 + 16}px` }}
                className="h-6 flex items-center pr-2"
              >
                <FileIcon 
                  name={newItemName} 
                  isFolder={creatingType === 'folder'} 
                  isOpen={false} 
                  size={14} 
                />
                <input
                  type="text"
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitCreate();
                    if (e.key === 'Escape') setCreatingType(null);
                  }}
                  onBlur={handleCommitCreate}
                  placeholder={creatingType === 'file' ? 'filename.ts' : 'folder-name'}
                  className="ml-2 w-full bg-[#1e1e1e] border border-[#007acc] text-xs text-white px-1 py-0.5 outline-none rounded-none"
                />
              </div>
            )}

            {isExpanded && item.children && renderTree(item.children, depth + 1)}
          </div>
        );
      }

      // File item
      return (
        <div
          key={item.id}
          onClick={() => onSelectFile(item)}
          style={{ 
            paddingLeft: `${depth * 14 + 20}px`,
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : undefined
          }}
          className={`h-6 flex items-center justify-between pr-2 text-xs cursor-pointer group transition-colors ${
            isActive 
              ? 'text-white font-medium' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
        >
          {isEditing ? (
            <div className="flex items-center gap-1.5 w-full">
              <FileIcon name={editingName} size={14} />
              <input
                type="text"
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommitRename(item.id);
                  if (e.key === 'Escape') setEditingFileId(null);
                }}
                onBlur={() => handleCommitRename(item.id)}
                className="w-full bg-[#1e1e1e] border border-[#007acc] text-xs text-white px-1 py-0.5 outline-none"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 truncate">
                <FileIcon name={item.name} size={14} />
                <span className="truncate">{item.name}</span>
                {item.isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
              </div>

              {/* Hover actions: rename & delete */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-neutral-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFileId(item.id);
                    setEditingName(item.name);
                  }}
                  title="Rename"
                  className="hover:text-white p-0.5"
                >
                  <Edit2 size={11} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(item.id);
                  }}
                  title="Delete"
                  className="hover:text-red-400 p-0.5"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full select-none text-xs">
      {/* View Header */}
      <div className="h-8 px-4 flex items-center justify-between tracking-wide font-medium text-neutral-300 text-[11px] uppercase border-b border-white/5 shrink-0">
        <span>Explorer</span>
        <button className="text-neutral-400 hover:text-white">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Open Editors Section */}
        <div className="border-b border-white/5">
          <button
            onClick={() => setIsOpenEditorsOpen(!isOpenEditorsOpen)}
            className="w-full h-6 px-3 flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-white"
          >
            {isOpenEditorsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="uppercase">Open Editors</span>
            <span className="text-[10px] text-neutral-500 font-mono ml-1">({openTabs.length})</span>
          </button>

          {isOpenEditorsOpen && (
            <div className="pb-1">
              {openTabs.map((tab) => {
                const isActive = activeFileId === tab.fileId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      const found = files.flatMap(function flatten(f): WorkspaceFile[] {
                        return f.children ? [f, ...f.children.flatMap(flatten)] : [f];
                      }).find((f) => f.id === tab.fileId);
                      if (found) onSelectFile(found);
                    }}
                    style={{
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : undefined,
                    }}
                    className={`h-6 pl-6 pr-2 flex items-center justify-between text-xs cursor-pointer group ${
                      isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon name={tab.title} size={14} />
                      <span className="truncate">{tab.title}</span>
                      {tab.isDirty && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-white p-0.5 rounded text-neutral-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Workspace Root Section */}
        <div>
          <div className="h-7 px-3 flex items-center justify-between text-[11px] font-semibold text-neutral-400 border-b border-white/5">
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="flex items-center gap-1 hover:text-white uppercase tracking-wider truncate"
            >
              {isWorkspaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="truncate">STUDIO-WORKSPACE</span>
            </button>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-1 text-neutral-400">
              <button
                onClick={() => handleStartCreate('file', '')}
                title="New File"
                className="hover:text-white p-1"
              >
                <FilePlus size={13} />
              </button>
              <button
                onClick={() => handleStartCreate('folder', '')}
                title="New Folder"
                className="hover:text-white p-1"
              >
                <FolderPlus size={13} />
              </button>
              <button
                onClick={() => {
                  setExpandedFolders({
                    'src': true,
                    'src/components': true,
                    'src/utils': true,
                  });
                }}
                title="Refresh Explorer"
                className="hover:text-white p-1"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {isWorkspaceOpen && (
            <div className="py-1">
              {/* Root Creation Input */}
              {creatingType && targetParentPath === '' && (
                <div className="h-6 flex items-center px-4">
                  <FileIcon 
                    name={newItemName} 
                    isFolder={creatingType === 'folder'} 
                    isOpen={false} 
                    size={14} 
                  />
                  <input
                    type="text"
                    autoFocus
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommitCreate();
                      if (e.key === 'Escape') setCreatingType(null);
                    }}
                    onBlur={handleCommitCreate}
                    placeholder={creatingType === 'file' ? 'filename.ts' : 'folder-name'}
                    className="ml-2 w-full bg-[#1e1e1e] border border-[#007acc] text-xs text-white px-1 py-0.5 outline-none"
                  />
                </div>
              )}

              {renderTree(files)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
