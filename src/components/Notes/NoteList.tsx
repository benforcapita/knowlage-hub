import React from 'react';
import { FileText, Calendar, Tag, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { Note, Folder as FolderType } from '../../types';

interface NoteListProps {
  notes: Note[];
  folders: FolderType[];
  selectedNote?: Note;
  onNoteSelect: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
  searchQuery: string;
}

export function NoteList({ 
  notes, 
  folders, 
  selectedNote, 
  onNoteSelect, 
  onNoteDelete, 
  searchQuery 
}: NoteListProps) {
  const getFolderName = (folderId?: string) => {
    if (!folderId) return null;
    const folder = folders.find(f => f.id === folderId);
    return folder?.name;
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
      ) : part
    );
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <FileText className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">No notes found</p>
        <p className="text-sm">
          {searchQuery ? 'Try adjusting your search terms' : 'Create your first note to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => {
        const isSelected = selectedNote?.id === note.id;
        const folderName = getFolderName(note.folderId);
        
        return (
          <div
            key={note.id}
            onClick={() => onNoteSelect(note)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {highlightText(note.title, searchQuery)}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteDelete(note.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {highlightText(note.content.slice(0, 150), searchQuery)}
              {note.content.length > 150 && '...'}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                {folderName && (
                  <div className="flex items-center gap-1">
                    <Folder className="w-3 h-3" />
                    <span>{folderName}</span>
                  </div>
                )}
                
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{note.tags.slice(0, 2).join(', ')}</span>
                    {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(note.updatedAt), 'MMM d')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}