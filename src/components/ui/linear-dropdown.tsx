import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Flame, Minus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper function to get consistent priority display (matches prompt cards)
export const getPriorityDisplay = (priority: number) => {
  if (priority === 1) {
    return { icon: Flame, color: 'text-destructive' };
  }
  if (priority === 2) {
    return { icon: Minus, color: 'text-orange-500' };
  }
  return { icon: Clock, color: 'text-muted-foreground' };
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
}

export const LinearDropdown: React.FC<LinearDropdownProps> = ({
  trigger,
  options,
  placeholder = "Select option",
  allowMultiple = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-popover border border-border shadow-lg z-50"
        align="start"
        sideOffset={4}
      >
        {options.map((option) => {
          const IconComponent = option.icon;
          
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={option.onClick}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground",
                option.isSelected && "bg-accent/50"
              )}
            >
              {IconComponent && (
                <IconComponent 
                  className={cn(
                    "w-4 h-4",
                    option.color && `text-[${option.color}]`
                  )} 
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