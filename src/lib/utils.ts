import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Prompt } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
