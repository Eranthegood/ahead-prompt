import React, { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemover';
import chessKnightLogo from "@/assets/chess-knight-logo.png";

interface ProcessedLogoProps {
  className?: string;
  alt?: string;
}

export function ProcessedLogo({ className = "w-6 h-6", alt = "Ahead Logo" }: ProcessedLogoProps) {
  const [processedLogoSrc, setProcessedLogoSrc] = useState<string>(chessKnightLogo);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processLogo = async () => {
      try {
        // Load the original logo
        const response = await fetch(chessKnightLogo);
        const blob = await response.blob();
        
        // Convert to image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Convert to data URL for use in img src
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedLogoSrc(processedUrl);
      } catch (error) {
        console.error('Error processing knight logo:', error);
        // Keep original logo as fallback
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();

    // Cleanup URL object when component unmounts
    return () => {
      if (processedLogoSrc !== chessKnightLogo) {
        URL.revokeObjectURL(processedLogoSrc);
      }
    };
  }, []);

  return (
    <img 
      src={processedLogoSrc} 
      alt={alt} 
      className={className}
      style={isProcessing ? { opacity: 0.7 } : undefined}
    />
  );
}
