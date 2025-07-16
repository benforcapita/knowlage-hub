export class SearchService {
  static searchNotes(notes: any[], query: string): any[] {
    if (!query.trim()) return notes;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return notes.filter(note => {
      const searchableText = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  static searchKanbanCards(cards: any[], query: string): any[] {
    if (!query.trim()) return cards;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return cards.filter(card => {
      const searchableText = `${card.title} ${card.description || ''}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  static searchPasswords(entries: any[], query: string): any[] {
    if (!query.trim()) return entries;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return entries.filter(entry => {
      const searchableText = `${entry.name} ${entry.url || ''} ${entry.username}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  static highlightText(text: string, query: string): string {
    if (!query.trim()) return text;
    
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  }
}