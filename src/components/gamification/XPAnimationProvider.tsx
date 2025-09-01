import React, { useEffect } from 'react';
import { XPAnimationOverlay, useXPAnimations } from './XPAnimationOverlay';

interface XPAnimationProviderProps {
  children: React.ReactNode;
}

export const XPAnimationProvider: React.FC<XPAnimationProviderProps> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};