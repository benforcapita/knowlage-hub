import React, { useState, useEffect } from 'react';
import { Plus, FolderPlus, Shield } from 'lucide-react';
import { PasswordEntry, PasswordCategory } from '../../types';
import { PasswordEntry as EntryComponent } from './PasswordEntry';
import { PasswordEditor } from './PasswordEditor';
import { PasswordGenerator } from './PasswordGenerator';
import { storageService } from '../../utils/storage';
import { SearchService } from '../../utils/search';

interface PasswordsModuleProps {
  searchQuery: string;
}

export function PasswordsModule({ searchQuery }: PasswordsModuleProps) {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<PasswordCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | undefined>();
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    loadEntries();
    loadCategories();
  }, []);

  const loadEntries = async () => {
    try {
      const loadedEntries = await storageService.getAll<PasswordEntry>('password_entries');
      setEntries(loadedEntries.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to load password entries:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const loadedCategories = await storageService.getAll<PasswordCategory>('password_categories');
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSaveEntry = async (entryData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const entry: PasswordEntry = {
        ...entryData,
        id: editingEntry?.id || crypto.randomUUID(),
        createdAt: editingEntry?.createdAt || now,
        updatedAt: now,
      };

      await storageService.put('password_entries', entry);
      await loadEntries();
      setIsEditing(false);
      setEditingEntry(undefined);
    } catch (error) {
      console.error('Failed to save password entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this password entry?')) {
      try {
        await storageService.delete('password_entries', entryId);
        await loadEntries();
      } catch (error) {
        console.error('Failed to delete password entry:', error);
      }
    }
  };

  const handleCreateCategory = async () => {
    const name = prompt('Enter category name:');
    if (name?.trim()) {
      try {
        const category: PasswordCategory = {
          id: crypto.randomUUID(),
          name: name.trim(),
          createdAt: new Date(),
        };
        await storageService.put('password_categories', category);
        await loadCategories();
      } catch (error) {
        console.error('Failed to create category:', error);
      }
    }
  };

  const filteredEntries = SearchService.searchPasswords(entries, searchQuery)
    .filter(entry => !selectedCategory || entry.categoryId === selectedCategory);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Passwords</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCreateCategory}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Create category"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditingEntry(undefined);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All Passwords ({entries.length})
            </button>
            
            {categories.map(category => {
              const count = entries.filter(e => e.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            Password Generator
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 dark:bg-gray-800">
        {showGenerator ? (
          <div className="p-6">
            <PasswordGenerator onUsePassword={() => {}} />
          </div>
        ) : (
          <>
            {filteredEntries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {searchQuery ? 'No passwords found' : 'No passwords yet'}
                  </p>
                  <p className="text-sm mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms' 
                      : 'Create your first password entry to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => {
                        setEditingEntry(undefined);
                        setIsEditing(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Password
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedCategory ? getCategoryName(selectedCategory) : 'All Passwords'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredEntries.length} password{filteredEntries.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid gap-4">
                  {filteredEntries.map(entry => (
                    <EntryComponent
                      key={entry.id}
                      entry={entry}
                      onEdit={(entry) => {
                        setEditingEntry(entry);
                        setIsEditing(true);
                      }}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isEditing && (
        <PasswordEditor
          entry={editingEntry}
          categories={categories}
          onSave={handleSaveEntry}
          onCancel={() => {
            setIsEditing(false);
            setEditingEntry(undefined);
          }}
        />
      )}
    </div>
  );
}