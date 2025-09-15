import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { copyText } from '@/lib/clipboard';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { useSidebar } from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';

const PROMO_CODE = 'Early';
const END_DATE = new Date('2025-09-21T23:59:59');
const DISMISSED_KEY = 'promo-banner-dismissed';

export function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  
  // Only access sidebar state if we're on a sidebar page
  const allowedSidebarPages = ['/build', '/integrations'];
  const canShowSidebar = allowedSidebarPages.some(path => location.pathname.startsWith(path));
  
  // Safely get sidebar state
  let sidebarState = null;
  try {
    if (canShowSidebar) {
      sidebarState = useSidebar();
    }
  } catch {
    // useSidebar not available, fallback to default
  }

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Update countdown every second
    const updateCountdown = () => {
      const now = new Date();
      
      if (now >= END_DATE) {
        setIsExpired(true);
        return;
      }

      const days = differenceInDays(END_DATE, now);
      const hours = differenceInHours(END_DATE, now) % 24;
      const minutes = differenceInMinutes(END_DATE, now) % 60;
      const seconds = differenceInSeconds(END_DATE, now) % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyPromoCode = async () => {
    const success = await copyText(PROMO_CODE);
    if (success) {
      toast({
        title: "Promo code copied!",
        description: `"${PROMO_CODE}" copied to clipboard`,
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  // Don't show if expired or dismissed
  if (isExpired || isDismissed) {
    return null;
  }

  // Calculate sidebar-aware styles
  const getSidebarAwareStyles = () => {
    if (!canShowSidebar || !sidebarState) {
      return "relative bg-gradient-to-r from-primary to-primary-glow text-primary-foreground";
    }
    
    const { state } = sidebarState;
    const isCollapsed = state === 'collapsed';
    
    return `relative bg-gradient-to-r from-primary to-primary-glow text-primary-foreground transition-all duration-300 ${
      isCollapsed ? 'ml-14' : 'ml-64'
    }`;
  };

  return (
    <div className={getSidebarAwareStyles()}>
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm sm:text-base">
            <span className="font-medium">
              For early adopters: <span className="font-bold">-30%</span> until {timeLeft} with promocode
            </span>
            <button
              onClick={handleCopyPromoCode}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-md transition-colors duration-200"
            >
              <span className="font-mono font-bold text-primary-foreground">{PROMO_CODE}</span>
              <Copy className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-primary-foreground/20 rounded-md transition-colors duration-200"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}