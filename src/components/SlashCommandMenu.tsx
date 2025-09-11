import React, { useState, useEffect, useMemo } from 'react';
import { Book, Hash, List, Heading1, Code, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SlashCommandItem } from '@/extensions/SlashCommandExtension';

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  query?: string;
  onSelect: (item: SlashCommandItem) => void;
  onClose: () => void;
}

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Bug Fix':
      return Code;
    case 'Feature':
      return Star;
    case 'Documentation':
      return Book;
    default:
      return Hash;
  }
};

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  items,
  query = '',
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter and sort items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items;
    }

    return items
      .filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .sort((a, b) => {
        // Prioritize title matches
        const aTitle = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitle = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        
        // Then by relevance (exact matches first)
        const aExact = a.title.toLowerCase().startsWith(query.toLowerCase());
        const bExact = b.title.toLowerCase().startsWith(query.toLowerCase());
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return 0;
      });
  }, [items, query]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  if (filteredItems.length === 0) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-4 w-80 animate-fade-in">
        <div className="text-muted-foreground text-sm text-center">
          No templates found for "{query}"
        </div>
      </div>
    );
  }

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg w-80 max-h-64 overflow-y-auto animate-fade-in">
      <div className="p-2 border-b border-border">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {query ? `Search: ${query}` : 'Templates'}
        </div>
      </div>
      
      <div className="p-1">
        {filteredItems.map((item, index) => {
          const Icon = getCategoryIcon(item.category);
          const isSelected = index === selectedIndex;
          
          return (
            <button
              key={item.id}
              className={cn(
                "w-full text-left p-3 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isSelected && "bg-accent text-accent-foreground"
              )}
              onClick={() => onSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {item.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {item.category}
                      </span>
                    )}
                    {item.tags.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {item.tags.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="p-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          ↑↓ to navigate • Enter to select • Esc to close
        </div>
      </div>
    </div>
  );
};