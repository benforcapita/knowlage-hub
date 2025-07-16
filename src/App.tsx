import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { NotesModule } from './components/Notes/NotesModule';
import { KanbanModule } from './components/Kanban/KanbanModule';
import { PasswordsModule } from './components/Passwords/PasswordsModule';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDatabase } from './hooks/useDatabase';
import { AppSettings, Module } from './types';

function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', {
    theme: 'light',
    currentModule: 'notes',
    sidebarCollapsed: false,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const { isInitialized, error } = useDatabase();

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleModuleChange = (module: Module) => {
    setSettings(prev => ({ ...prev, currentModule: module }));
    setSearchQuery(''); // Clear search when switching modules
  };

  const handleThemeToggle = () => {
    setSettings(prev => ({ 
      ...prev, 
      theme: prev.theme === 'light' ? 'dark' : 'light' 
    }));
  };

  const handleToggleSidebar = () => {
    setSettings(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  const getSearchPlaceholder = () => {
    switch (settings.currentModule) {
      case 'notes': return 'Search notes...';
      case 'kanban': return 'Search cards...';
      case 'passwords': return 'Search passwords...';
      default: return 'Search...';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center">
            <span className="text-red-600 dark:text-red-400 text-2xl">⚠</span>
          </div>
          <h1 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
            Database Error
          </h1>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Initializing Knowledge Vault
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Setting up your secure workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        currentModule={settings.currentModule}
        onModuleChange={handleModuleChange}
        collapsed={settings.sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          theme={settings.theme}
          onThemeToggle={handleThemeToggle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={getSearchPlaceholder()}
        />
        
        <main className="flex-1 overflow-hidden">
          {settings.currentModule === 'notes' && (
            <NotesModule searchQuery={searchQuery} />
          )}
          {settings.currentModule === 'kanban' && (
            <KanbanModule searchQuery={searchQuery} />
          )}
          {settings.currentModule === 'passwords' && (
            <PasswordsModule searchQuery={searchQuery} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;