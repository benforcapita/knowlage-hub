import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { KanbanColumn as Column, KanbanCard } from '../../types';
import { KanbanCard as CardComponent } from './KanbanCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  column: Column;
  cards: KanbanCard[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function KanbanColumn({ 
  column, 
  cards, 
  onAddCard, 
  onEditCard, 
  onDeleteCard,
  onEditColumn,
  onDeleteColumn 
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const sortedCards = cards.sort((a, b) => a.position - b.position);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 w-80 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddCard(column.id)}
            className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="relative group">
            <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onEditColumn(column)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Edit column
              </button>
              <button
                onClick={() => onDeleteColumn(column.id)}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Delete column
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-32"
      >
        <SortableContext items={sortedCards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {sortedCards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}