import { removeBackground, loadImage } from './backgroundRemover';

export const processKnightLogo = async (): Promise<string> => {
  try {
    // Load the original logo
    const response = await fetch('/src/assets/chess-knight-logo.png');
    const blob = await response.blob();
    
    // Convert to image element
    const imageElement = await loadImage(blob);
    
    // Remove background
    const processedBlob = await removeBackground(imageElement);
    
    // Convert to data URL for use in img src
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(processedBlob);
    });
  } catch (error) {
    console.error('Error processing knight logo:', error);
    // Fallback to original logo
    return '/src/assets/chess-knight-logo.png';
  }
};