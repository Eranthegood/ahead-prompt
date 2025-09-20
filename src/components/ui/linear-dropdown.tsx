import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Flame, Minus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Re-export unified priority display helper
export { getPriorityDisplay } from '@/lib/utils';

// Color mapping function to handle different color formats
const getColorClass = (color?: string) => {
  if (!color) return '';
  
  // If color already has text- prefix, return as is
  if (color.startsWith('text-')) return color;
  
  // Map clean color identifiers to proper Tailwind classes
  const colorMap: Record<string, string> = {
    'destructive': 'text-destructive',
    'orange-500': 'text-orange-500',
    'muted-foreground': 'text-muted-foreground',
    'primary': 'text-primary',
    'secondary': 'text-secondary',
  };
  
  return colorMap[color] || `text-${color}`;
};

interface DropdownOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  onClick: () => void;
  isSelected?: boolean;
}

interface LinearDropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  placeholder?: string;
  allowMultiple?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const LinearDropdown: React.FC<LinearDropdownProps> = ({
  trigger,
  options,
  placeholder = "Select option",
  allowMultiple = false,
  onOpenChange,
}) => {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-popover/95 backdrop-blur-sm border border-border shadow-lg z-[100]"
        align="start"
        sideOffset={4}
      >
        {options.map((option) => {
          const IconComponent = option.icon;
          const colorClass = getColorClass(option.color);
          
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                option.onClick();
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground",
                option.isSelected && "bg-accent/50"
              )}
            >
              {IconComponent && (
                <IconComponent 
                  className={cn("w-4 h-4", colorClass)} 
                />
              )}
              <span className="flex-1">{option.label}</span>
              {allowMultiple && option.isSelected && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};