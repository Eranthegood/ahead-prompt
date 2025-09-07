// Admin-only access to Prompt Enhancer
export const PROMPT_ENHANCER_ALLOWED_USERS = [
  // Add your user ID here after signing in
];

export const hasPromptEnhancerAccess = (userId: string | undefined): boolean => {
  if (!userId) return false;
  return PROMPT_ENHANCER_ALLOWED_USERS.includes(userId);
};

// Debug function to help admin get their user ID
export const getUserIdForAdmin = (user: any): string | null => {
  return user?.id || null;
};