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
  return null;
}