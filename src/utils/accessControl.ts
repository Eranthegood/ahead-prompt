// Liste des User IDs autorisés à accéder au Prompt Enhancer
export const PROMPT_ENHANCER_ALLOWED_USERS = [
  // Ajouter ici l'User ID spécifique
  'user-id-to-replace'
];

export const hasPromptEnhancerAccess = (userId: string | undefined): boolean => {
  if (!userId) return false;
  return PROMPT_ENHANCER_ALLOWED_USERS.includes(userId);
};