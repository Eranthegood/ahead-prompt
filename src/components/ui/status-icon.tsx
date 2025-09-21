import React from 'react';
import { Circle, CircleDot, CheckCircle, Loader2 } from 'lucide-react';
import { PromptStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusIconProps {
  status: PromptStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIcon({ status, size = 'md', className }: StatusIconProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const iconSize = sizeClasses[size];

  switch (status) {
    case 'todo':
      return <Circle className={cn(iconSize, 'text-muted-foreground', className)} />;
    case 'generating':
      return <Loader2 className={cn(iconSize, 'text-purple-500 animate-spin', className)} />;
    case 'in_progress':
      return <CircleDot className={cn(iconSize, 'text-blue-500', className)} />;
    case 'done':
      return <CheckCircle className={cn(iconSize, 'text-green-500 fill-green-500', className)} />;
    default:
      return <Circle className={cn(iconSize, 'text-muted-foreground', className)} />;
  }
}

export function getStatusIcon(status: PromptStatus) {
  switch (status) {
    case 'todo':
      return { icon: Circle, color: 'text-muted-foreground', label: 'To do' };
    case 'generating':
      return { icon: Loader2, color: 'text-purple-500 animate-spin', label: 'En génération...' };
    case 'in_progress':
      return { icon: CircleDot, color: 'text-blue-500', label: 'In progress' };
    case 'done':
      return { icon: CheckCircle, color: 'text-green-500 fill-green-500', label: 'Done' };
    default:
      return { icon: Circle, color: 'text-muted-foreground', label: 'To do' };
  }
}