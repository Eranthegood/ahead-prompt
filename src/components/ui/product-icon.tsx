import React from 'react';

interface ProductIconProps {
  className?: string;
  size?: number;
}

export const ProductIcon: React.FC<ProductIconProps> = ({ 
  className = "w-4 h-4", 
  size 
}) => {
  const style = size ? { width: size, height: size } : {};
  
  return (
    <img 
      src="/lovable-uploads/61d8976d-b1a5-4dfa-b3f3-9a1d1d26bde8.png" 
      alt="Product" 
      className={className}
      style={style}
    />
  );
};