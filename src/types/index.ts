export type FileLanguage = 
  | 'typescript' 
  | 'javascript' 
  | 'tsx' 
  | 'jsx' 
  | 'html' 
  | 'css' 
  | 'json' 
  | 'markdown' 
  | 'python' 
  | 'bash' 
  | 'plaintext';

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  content: string;
  initialContent: string;
  language: FileLanguage;
  isFolder: boolean;
  parentId?: string;
  children?: WorkspaceFile[];
  isOpen?: boolean;
  isModified?: boolean;
}

export interface TabItem {
  id: string;
  fileId: string;
  title: string;
  path: string;
  language: FileLanguage;
  isDirty: boolean;
}

export type ThemeId = 
  | 'vs-dark' 
  | 'one-dark-pro' 
  | 'github-dark' 
  | 'monokai' 
  | 'light-plus';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  type: 'dark' | 'light';
  bgMain: string;
  bgSidebar: string;
  bgActivityBar: string;
  bgTabActive: string;
  bgTabInactive: string;
  bgStatusBar: string;
  fgStatusBar: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  selectionBg: string;
  lineHighlight: string;
  accent: string;
}

export type SidebarTab = 
  | 'explorer' 
  | 'search' 
  | 'git' 
  | 'debug' 
  | 'extensions' 
  | 'ai' 
  | 'settings';

export type BottomTab = 
  | 'terminal' 
  | 'problems' 
  | 'output' 
  | 'debugConsole' 
  | 'aiLog';

export interface ProblemItem {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  fileId: string;
  fileName: string;
  line: number;
  col: number;
}

export interface ExtensionItem {
  id: string;
  name: string;
  publisher: string;
  description: string;
  version: string;
  downloads: string;
  rating: number;
  installed: boolean;
  category: string;
  iconBg: string;
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  date: string;
  hash: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  formatOnSave: boolean;
  autoSave: boolean;
}

export interface CommandItem {
  id: string;
  title: string;
  category?: string;
  shortcut?: string;
  action: () => void;
}
