import React, { useEffect } from 'react';
import { XPAnimationOverlay, useXPAnimations } from './XPAnimationOverlay';
import { subscribeToXPAnimations } from '@/hooks/useGamification';

interface XPAnimationProviderProps {
  children: React.ReactNode;
}

export const XPAnimationProvider: React.FC<XPAnimationProviderProps> = ({ children }) => {
  const { particles, triggerXPAnimation, removeParticle } = useXPAnimations();

  useEffect(() => {
    const unsubscribe = subscribeToXPAnimations((event) => {
      triggerXPAnimation(event.xp, event.element, event.type);
    });

    return unsubscribe;
  }, [triggerXPAnimation]);

  return (
    <>
      {children}
      <XPAnimationOverlay 
        particles={particles} 
        onParticleComplete={removeParticle} 
      />
    </>
  );
};