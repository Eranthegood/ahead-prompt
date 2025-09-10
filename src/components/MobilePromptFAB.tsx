import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface MobilePromptFABProps {
  onOpenPrompt: () => void;
  isQuickPromptOpen: boolean;
}

export function MobilePromptFAB({ onOpenPrompt, isQuickPromptOpen }: MobilePromptFABProps) {
  const isMobile = useIsMobile();
  const { open: sidebarOpen } = useSidebar();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Debug logging to understand visibility conditions
  React.useEffect(() => {
    console.log('MobilePromptFAB Debug:', {
      isMobile,
      sidebarOpen,
      isQuickPromptOpen,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined',
      shouldRender: isMobile && !sidebarOpen && !isQuickPromptOpen
    });
  }, [isMobile, sidebarOpen, isQuickPromptOpen]);

  // Hide FAB when scrolling up, show when scrolling down
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const scrollThreshold = 10; // Only trigger after 10px of scroll

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setIsVisible(!scrollingUp || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  // Don't render if:
  // - Not on mobile
  // - Quick prompt dialog is already open
  // For debugging, we're being more lenient with sidebar condition
  if (!isMobile || isQuickPromptOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
        isVisible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-16 opacity-0 scale-95"
      )}
    >
      <Button
        size="icon"
        className={cn(
          "h-16 w-16 rounded-full shadow-xl shadow-primary/30",
          "bg-gradient-to-r from-primary to-primary/90",
          "hover:from-primary/90 hover:to-primary/80",
          "text-primary-foreground",
          "border-3 border-background/50 backdrop-blur-sm",
          "active:scale-95 transition-all duration-200 ease-out",
          "focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          "hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
        )}
        onClick={onOpenPrompt}
        aria-label="Create new prompt - Tap to capture your next AI idea"
      >
        <Plus 
          size={28} 
          className="transition-transform duration-200 group-active:scale-90 drop-shadow-sm" 
        />
      </Button>
    </div>
  );
}