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
  FileText,
  Github,
  GitBranch,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { Epic } from '@/types';

interface EpicContextMenuProps {
  children: React.ReactNode;
  epic: Epic;
  onAddPrompt: (epicId: string) => void;
  onEditEpic: (epic: Epic) => void;
  onDeleteEpic: (epic: Epic) => void;
  onConfigureGit?: (epicId: string) => void;
  onToggleComplete?: (epic: Epic) => void;
}

export function EpicContextMenu({
  children,
  epic,
  onAddPrompt,
  onEditEpic,
  onDeleteEpic,
  onConfigureGit,
  onToggleComplete,
}: EpicContextMenuProps) {
  // For now, we'll use a simple approach since Epic doesn't have status in DB yet
  // This can be extended when status field is added to the epics table
  const isCompleted = false; // TODO: Replace with epic.status === 'completed' when DB is updated
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
        {onConfigureGit && (
          <ContextMenuItem 
            onClick={() => onConfigureGit(epic.id)}
            className="flex items-center gap-2"
          >
            <GitBranch className="h-4 w-4" />
            Git Settings
          </ContextMenuItem>
        )}
        
        {onToggleComplete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={() => onToggleComplete(epic)}
              className="flex items-center gap-2"
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Rouvrir l'epic
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Clôturer l'epic
                </>
              )}
            </ContextMenuItem>
          </>
        )}
        
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