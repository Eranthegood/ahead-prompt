import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Columns } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ViewMode = 'list' | 'kanban';

interface DashboardViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function DashboardViewToggle({ viewMode, onViewModeChange }: DashboardViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`h-8 w-8 p-0 transition-all ${
                viewMode === 'list' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>List View</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('kanban')}
              className={`h-8 w-8 p-0 transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Kanban View</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}