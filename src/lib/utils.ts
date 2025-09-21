import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Prompt } from "@/types"
import { Flame, Minus, Clock } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Unified priority display function - single source of truth for all priority UI
 */
export function getPriorityDisplay(priority: number) {
  switch (priority) {
    case 1:
      return { 
        icon: Flame, 
        color: 'text-destructive', 
        label: 'High',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20'
      };
    case 2:
      return { 
        icon: Minus, 
        color: 'text-orange-500', 
        label: 'Normal',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20'
      };
    case 3:
    default:
      return { 
        icon: Clock, 
        color: 'text-muted-foreground', 
        label: 'Low',
        bgColor: 'bg-muted/50',
        borderColor: 'border-muted'
      };
  }
}

/**
 * Determines if a prompt is ready to be used/copied
 */
export function isPromptUsable(prompt: Prompt): boolean {
  // If generating, not usable
  if (prompt.status === 'generating') return false;
  
  // If has generated content, always usable
  if (prompt.generated_prompt && prompt.generated_prompt.trim().length > 0) return true;
  
  // Otherwise, check if description is sufficient (at least 10 characters)
  return !!(prompt.description && prompt.description.trim().length >= 10);
}

/**
 * Determines if a prompt should be visible in the UI (includes generating prompts)
 */
export function isPromptVisible(prompt: Prompt): boolean {
  return true; // All prompts are visible, including generating ones
}
