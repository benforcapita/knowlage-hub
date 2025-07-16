import React, { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import { KanbanBoard, KanbanColumn, KanbanCard } from '../../types';
import { KanbanColumn as ColumnComponent } from './KanbanColumn';
import { CardEditor } from './CardEditor';
import { storageService } from '../../utils/storage';
import { SearchService } from '../../utils/search';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface KanbanModuleProps {
  searchQuery: string;
}

export function KanbanModule({ searchQuery }: KanbanModuleProps) {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<KanbanBoard | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [editingCard, setEditingCard] = useState<KanbanCard | undefined>();
  const [editingColumnId, setEditingColumnId] = useState<string>('');
  const [isCardEditorOpen, setIsCardEditorOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (currentBoard) {
      loadColumns();
      loadCards();
    }
  }, [currentBoard]);

  const loadBoards = async () => {
    try {
      const loadedBoards = await storageService.getAll<KanbanBoard>('kanban_boards');
      setBoards(loadedBoards);
      if (loadedBoards.length > 0 && !currentBoard) {
        setCurrentBoard(loadedBoards[0]);
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
    }
  };

  const loadColumns = async () => {
    if (!currentBoard) return;
    try {
      const loadedColumns = await storageService.getAll<KanbanColumn>('kanban_columns');
      const boardColumns = loadedColumns
        .filter(col => col.boardId === currentBoard.id)
        .sort((a, b) => a.position - b.position);
      setColumns(boardColumns);
    } catch (error) {
      console.error('Failed to load columns:', error);
    }
  };

  const loadCards = async () => {
    if (!currentBoard) return;
    try {
      const loadedCards = await storageService.getAll<KanbanCard>('kanban_cards');
      const boardCards = loadedCards.filter(card => {
        const column = columns.find(col => col.id === card.columnId);
        return column?.boardId === currentBoard.id;
      });
      setCards(boardCards);
    } catch (error) {
      console.error('Failed to load cards:', error);
    }
  };

  const createBoard = async () => {
    const name = prompt('Enter board name:');
    if (name?.trim()) {
      try {
        const board: KanbanBoard = {
          id: crypto.randomUUID(),
          name: name.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await storageService.put('kanban_boards', board);
        
        // Create default columns
        const defaultColumns = ['To Do', 'In Progress', 'Done'];
        for (let i = 0; i < defaultColumns.length; i++) {
          const column: KanbanColumn = {
            id: crypto.randomUUID(),
            boardId: board.id,
            name: defaultColumns[i],
            position: i,
            createdAt: new Date(),
          };
          await storageService.put('kanban_columns', column);
        }
        
        await loadBoards();
        setCurrentBoard(board);
      } catch (error) {
        console.error('Failed to create board:', error);
      }
    }
  };

  const createColumn = async () => {
    if (!currentBoard) return;
    const name = prompt('Enter column name:');
    if (name?.trim()) {
      try {
        const column: KanbanColumn = {
          id: crypto.randomUUID(),
          boardId: currentBoard.id,
          name: name.trim(),
          position: columns.length,
          createdAt: new Date(),
        };
        await storageService.put('kanban_columns', column);
        await loadColumns();
      } catch (error) {
        console.error('Failed to create column:', error);
      }
    }
  };

  const handleSaveCard = async (cardData: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const card: KanbanCard = {
        ...cardData,
        id: editingCard?.id || crypto.randomUUID(),
        createdAt: editingCard?.createdAt || now,
        updatedAt: now,
      };

      await storageService.put('kanban_cards', card);
      await loadCards();
      setIsCardEditorOpen(false);
      setEditingCard(undefined);
      setEditingColumnId('');
    } catch (error) {
      console.error('Failed to save card:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await storageService.delete('kanban_cards', cardId);
        await loadCards();
      } catch (error) {
        console.error('Failed to delete card:', error);
      }
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (confirm('Are you sure you want to delete this column and all its cards?')) {
      try {
        // Delete all cards in the column
        const columnCards = cards.filter(card => card.columnId === columnId);
        for (const card of columnCards) {
          await storageService.delete('kanban_cards', card.id);
        }
        
        // Delete the column
        await storageService.delete('kanban_columns', columnId);
        await loadColumns();
        await loadCards();
      } catch (error) {
        console.error('Failed to delete column:', error);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find(c => c.id === event.active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    const overId = over.id;
    const overColumn = columns.find(col => col.id === overId);
    
    if (overColumn && activeCard.columnId !== overColumn.id) {
      setCards(prevCards => {
        const updatedCards = prevCards.map(card => 
          card.id === activeCard.id 
            ? { ...card, columnId: overColumn.id }
            : card
        );
        return updatedCards;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    
    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    try {
      await storageService.put('kanban_cards', activeCard);
    } catch (error) {
      console.error('Failed to update card position:', error);
    }
  };

  const filteredCards = SearchService.searchKanbanCards(cards, searchQuery);

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No boards found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first Kanban board to get started</p>
          <button
            onClick={createBoard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <select
            value={currentBoard.id}
            onChange={(e) => {
              const board = boards.find(b => b.id === e.target.value);
              setCurrentBoard(board || null);
            }}
            className="text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white"
          >
            {boards.map(board => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={createColumn}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Column
          </button>
          <button
            onClick={createBoard}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Board
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-h-full">
            {columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                cards={filteredCards.filter(card => card.columnId === column.id)}
                onAddCard={(columnId) => {
                  setEditingColumnId(columnId);
                  setEditingCard(undefined);
                  setIsCardEditorOpen(true);
                }}
                onEditCard={(card) => {
                  setEditingCard(card);
                  setEditingColumnId(card.columnId);
                  setIsCardEditorOpen(true);
                }}
                onDeleteCard={handleDeleteCard}
                onEditColumn={(column) => {
                  const newName = prompt('Enter new column name:', column.name);
                  if (newName?.trim()) {
                    const updatedColumn = { ...column, name: newName.trim() };
                    storageService.put('kanban_columns', updatedColumn);
                    loadColumns();
                  }
                }}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeCard ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg rotate-3">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {activeCard.title}
                </h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {isCardEditorOpen && (
        <CardEditor
          card={editingCard}
          columnId={editingColumnId}
          onSave={handleSaveCard}
          onCancel={() => {
            setIsCardEditorOpen(false);
            setEditingCard(undefined);
            setEditingColumnId('');
          }}
        />
      )}
    </div>
  );
}