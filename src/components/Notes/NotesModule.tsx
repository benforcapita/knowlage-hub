import React, { useState, useEffect } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { Note, Folder } from '../../types';
import { NoteEditor } from './NoteEditor';
import { NoteList } from './NoteList';
import { storageService } from '../../utils/storage';
import { SearchService } from '../../utils/search';

interface NotesModuleProps {
  searchQuery: string;
}

export function NotesModule({ searchQuery }: NotesModuleProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();

  useEffect(() => {
    loadNotes();
    loadFolders();
  }, []);

  const loadNotes = async () => {
    try {
      const loadedNotes = await storageService.getAll<Note>('notes');
      setNotes(loadedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const loadedFolders = await storageService.getAll<Folder>('folders');
      setFolders(loadedFolders);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const note: Note = {
        ...noteData,
        id: editingNote?.id || crypto.randomUUID(),
        createdAt: editingNote?.createdAt || now,
        updatedAt: now,
      };

      await storageService.put('notes', note);
      await loadNotes();
      setIsEditing(false);
      setEditingNote(undefined);
      setSelectedNote(note);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await storageService.delete('notes', noteId);
        await loadNotes();
        if (selectedNote?.id === noteId) {
          setSelectedNote(undefined);
        }
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name?.trim()) {
      try {
        const folder: Folder = {
          id: crypto.randomUUID(),
          name: name.trim(),
          createdAt: new Date(),
        };
        await storageService.put('folders', folder);
        await loadFolders();
      } catch (error) {
        console.error('Failed to create folder:', error);
      }
    }
  };

  const filteredNotes = SearchService.searchNotes(notes, searchQuery);

  if (isEditing) {
    return (
      <NoteEditor
        note={editingNote}
        folders={folders}
        onSave={handleSaveNote}
        onCancel={() => {
          setIsEditing(false);
          setEditingNote(undefined);
        }}
      />
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCreateFolder}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Create folder"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditingNote(undefined);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <NoteList
            notes={filteredNotes}
            folders={folders}
            selectedNote={selectedNote}
            onNoteSelect={setSelectedNote}
            onNoteDelete={handleDeleteNote}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      <div className="flex-1 bg-gray-50 dark:bg-gray-800">
        {selectedNote ? (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedNote.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                    {selectedNote.tags.length > 0 && (
                      <div className="flex gap-1">
                        {selectedNote.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingNote(selectedNote);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-white leading-relaxed">
                  {selectedNote.content}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium mb-2">No note selected</p>
              <p className="text-sm">Select a note from the list or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}