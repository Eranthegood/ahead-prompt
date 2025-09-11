import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { resolvedTheme, isLoading, effectiveTheme } = useTheme();
  
  // Apply theme immediately on mount with smooth transition
  useEffect(() => {
    const root = document.documentElement;
    
    // Add transition for smooth theme changes
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Apply initial theme
    if (!isLoading && effectiveTheme) {
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
      console.log(`ThemeInitializer: Applied ${effectiveTheme} theme`);
    }
    
    // Cleanup transition after animation
    const timer = setTimeout(() => {
      root.style.transition = '';
    }, 300);
    
    return () => clearTimeout(timer);
  }, [effectiveTheme, isLoading]);
  
  // Set data attribute for additional styling hooks
  useEffect(() => {
    if (!isLoading && resolvedTheme) {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      console.log(`ThemeInitializer: Set data-theme to ${resolvedTheme}`);
    }
  }, [resolvedTheme, isLoading]);
  
  return <>{children}</>;
};