import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdaptiveTitleProps {
  children: string;
  className?: string;
  minSize?: number;
  maxSize?: number;
  reservedSpace?: number;
}

export function AdaptiveTitle({ 
  children, 
  className,
  minSize = 10,
  maxSize = 14,
  reservedSpace = 60 // Space reserved for badges/icons
}: AdaptiveTitleProps) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useEffect(() => {
    const adjustFontSize = () => {
      const element = titleRef.current;
      if (!element) return;

      const parent = element.parentElement;
      if (!parent) return;

      const parentWidth = parent.offsetWidth - reservedSpace;
      
      // Reset to max size to measure
      element.style.fontSize = `${maxSize}px`;
      
      let currentSize = maxSize;
      
      // Reduce font size until text fits or we reach minimum
      while (element.scrollWidth > parentWidth && currentSize > minSize) {
        currentSize -= 0.5;
        element.style.fontSize = `${currentSize}px`;
      }
      
      setFontSize(currentSize);
    };

    // Initial adjustment
    adjustFontSize();

    // Adjust on resize
    const resizeObserver = new ResizeObserver(adjustFontSize);
    const element = titleRef.current;
    
    if (element?.parentElement) {
      resizeObserver.observe(element.parentElement);
    }

    return () => {
      if (element?.parentElement) {
        resizeObserver.unobserve(element.parentElement);
      }
    };
  }, [children, minSize, maxSize, reservedSpace]);

  return (
    <span
      ref={titleRef}
      className={cn("truncate font-medium transition-all duration-200", className)}
      style={{ fontSize: `${fontSize}px` }}
      title={children}
    >
      {children}
    </span>
  );
}