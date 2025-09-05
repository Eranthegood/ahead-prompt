import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewType } from '@/hooks/useViewManager';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface ViewTransitionWrapperProps {
  children: React.ReactNode;
  viewType: ViewType;
  className?: string;
}

export function ViewTransitionWrapper({ 
  children, 
  viewType, 
  className = "" 
}: ViewTransitionWrapperProps) {
  const { preferences } = useUserPreferences();
  
  // Animation variants for different view types
  const getTransitionVariant = (type: ViewType) => {
    switch (type) {
      case 'list':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 }
        };
      case 'kanban':
        return {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 }
        };
      case 'grid':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2 }
        };
    }
  };

  // Skip animations if disabled in preferences
  if (!preferences.enableTransitionAnimations) {
    return <div className={className}>{children}</div>;
  }

  const variant = getTransitionVariant(viewType);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewType}
        className={className}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={variant.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}