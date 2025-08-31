import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  FileText
} from 'lucide-react';
import { Epic } from '@/types';

interface EpicContextMenuProps {
  children: React.ReactNode;
  epic: Epic;
  onAddPrompt: (epicId: string) => void;
  onEditEpic: (epic: Epic) => void;
  onDeleteEpic: (epic: Epic) => void;
}

export function EpicContextMenu({
  children,
  epic,
  onAddPrompt,
  onEditEpic,
  onDeleteEpic,
}: EpicContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={() => onAddPrompt(epic.id)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Prompt
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onEditEpic(epic)}
          className="flex items-center gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Edit Epic
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => onDeleteEpic(epic)}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete Epic
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}