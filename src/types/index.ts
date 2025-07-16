export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
}

export interface KanbanBoard {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: Date;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  position: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordEntry {
  id: string;
  name: string;
  url?: string;
  username: string;
  password: string;
  notes?: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordCategory {
  id: string;
  name: string;
  createdAt: Date;
}

export interface PasswordConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

export interface PassphraseConfig {
  wordCount: number;
  separator: string;
  includeNumbers: boolean;
  capitalizeWords: boolean;
}

export type Module = 'notes' | 'kanban' | 'passwords';

export interface AppSettings {
  theme: 'light' | 'dark';
  currentModule: Module;
  sidebarCollapsed: boolean;
}