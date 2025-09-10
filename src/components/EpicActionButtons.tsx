import React from 'react';
import { Palette, Calendar, Tag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LinearDropdown } from '@/components/ui/linear-dropdown';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EpicActionButtonsProps {
  color: string;
  onColorChange: (color: string) => void;
  priority: number;
  onPriorityChange: (priority: number) => void;
  dueDate?: Date;
  onDueDateChange: (date?: Date) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

const colorOptions = [
  { id: '#8B5CF6', label: 'Purple', color: '#8B5CF6' },
  { id: '#3B82F6', label: 'Blue', color: '#3B82F6' },
  { id: '#10B981', label: 'Green', color: '#10B981' },
  { id: '#F59E0B', label: 'Orange', color: '#F59E0B' },
  { id: '#EF4444', label: 'Red', color: '#EF4444' },
  { id: '#8B5CF6', label: 'Indigo', color: '#6366F1' },
  { id: '#EC4899', label: 'Pink', color: '#EC4899' },
  { id: '#6B7280', label: 'Gray', color: '#6B7280' },
];

const priorityOptions = [
  { id: 1, label: 'High', icon: Star, onClick: (onPriorityChange: (p: number) => void) => onPriorityChange(1) },
  { id: 2, label: 'Medium', icon: Star, onClick: (onPriorityChange: (p: number) => void) => onPriorityChange(2) },
  { id: 3, label: 'Normal', icon: Star, onClick: (onPriorityChange: (p: number) => void) => onPriorityChange(3) },
  { id: 4, label: 'Low', icon: Star, onClick: (onPriorityChange: (p: number) => void) => onPriorityChange(4) },
];

export function EpicActionButtons({
  color,
  onColorChange,
  priority,
  onPriorityChange,
  dueDate,
  onDueDateChange,
  tags,
  onTagsChange,
  className
}: EpicActionButtonsProps) {
  const [newTag, setNewTag] = React.useState('');

  const handleAddTag = (tagText: string) => {
    if (tagText.trim() && !tags.includes(tagText.trim())) {
      onTagsChange([...tags, tagText.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const getPriorityLabel = (p: number) => {
    switch (p) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Normal';
      case 4: return 'Low';
      default: return 'Normal';
    }
  };

  const getPriorityColor = (p: number) => {
    switch (p) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-blue-500';
      case 4: return 'text-gray-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Color Picker */}
      <LinearDropdown
        trigger={
          <Button variant="outline" size="sm" className="gap-2">
            <Palette className="h-4 w-4" />
            <div 
              className="w-3 h-3 rounded-full border" 
              style={{ backgroundColor: color }}
            />
            Color
          </Button>
        }
        options={colorOptions.map(option => ({
          id: option.id,
          label: option.label,
          onClick: () => onColorChange(option.id),
          isSelected: color === option.id,
          icon: () => (
            <div 
              className="w-4 h-4 rounded-full border" 
              style={{ backgroundColor: option.color }}
            />
          ),
        }))}
      />

      {/* Priority Selector */}
      <LinearDropdown
        trigger={
          <Button variant="outline" size="sm" className="gap-2">
            <Star className={cn("h-4 w-4", getPriorityColor(priority))} />
            {getPriorityLabel(priority)}
          </Button>
        }
        options={priorityOptions.map(option => ({
          id: option.id.toString(),
          label: option.label,
          onClick: () => option.onClick(onPriorityChange),
          isSelected: priority === option.id,
          icon: option.icon,
        }))}
      />

      {/* Due Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            {dueDate ? format(dueDate, 'MMM dd') : 'Due date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={dueDate}
            onSelect={onDueDateChange}
            initialFocus
            className="pointer-events-auto"
          />
          {dueDate && (
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDueDateChange(undefined)}
                className="w-full"
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(newTag);
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
              <Button
                size="sm"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Current tags:</div>
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}