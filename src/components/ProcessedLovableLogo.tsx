import React, { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '../utils/backgroundRemover';

interface ProcessedLovableLogoProps {
  className?: string;
  originalSrc: string;
}

export const ProcessedLovableLogo: React.FC<ProcessedLovableLogoProps> = ({ 
  className, 
  originalSrc 
}) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        
        // Fetch the original image
        const response = await fetch(originalSrc);
        const blob = await response.blob();
        
        // Load image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(processedUrl);
        
      } catch (err) {
        console.error('Error processing logo:', err);
        setError('Failed to process logo');
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup URL when component unmounts
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [originalSrc]);

  if (isProcessing) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !processedImageUrl) {
    // Fallback to original image if processing fails
    return (
      <img 
        src={originalSrc} 
        alt="Lovable Logo" 
        className={className}
      />
    );
  }

  return (
    <img 
      src={processedImageUrl} 
      alt="Lovable Logo" 
      className={className}
    />
  );
};