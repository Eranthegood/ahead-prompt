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
  // - Sidebar is open on mobile
  // - Quick prompt dialog is already open
  if (!isMobile || sidebarOpen || isQuickPromptOpen) {
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
          "h-14 w-14 rounded-full shadow-lg shadow-primary/25",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "border-2 border-background",
          "active:scale-95 transition-transform duration-150",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        )}
        onClick={onOpenPrompt}
        aria-label="Create new prompt"
      >
        <Plus 
          size={24} 
          className="transition-transform duration-200 group-active:scale-90" 
        />
      </Button>
    </div>
  );
}