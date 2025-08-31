/**
 * Utility functions for generating and handling descriptive titles
 */

/**
 * Generates a descriptive title from HTML or plain text content
 * @param content - The HTML or plain text content
 * @param maxLength - Maximum length for the generated title (default: 100)
 * @returns A descriptive title based on the content
 */
export function generateTitleFromContent(content: string, maxLength: number = 100): string {
  if (!content || content.trim() === '') return 'Nouvelle idée';
  
  // Remove HTML tags
  let plainText = content.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  plainText = plainText.replace(/\s+/g, ' ').trim();
  
  if (!plainText) return 'Nouvelle idée';
  
  // Remove common stop words (French)
  const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or'];
  const words = plainText.split(' ').filter(word => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:()]/g, '');
    return cleanWord.length > 2 && !stopWords.includes(cleanWord);
  });
  
  // Take meaningful words and construct title
  let title = words.slice(0, 10).join(' ');
  
  // If title is too long, truncate at word boundary
  if (title.length > maxLength) {
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    title = lastSpace > maxLength * 0.6 ? truncated.substring(0, lastSpace) : truncated;
  }
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return title || 'Nouvelle idée';
}

/**
 * Extract plain text from HTML content
 * @param html - HTML content
 * @returns Plain text without HTML tags
 */
export function extractTextFromHTML(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}