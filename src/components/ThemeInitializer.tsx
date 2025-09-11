import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocation } from 'react-router-dom';

export const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { resolvedTheme, isLoading } = useTheme();
  const location = useLocation();
  
  // Apply theme based on route - light mode only for /build
  useEffect(() => {
    const root = document.documentElement;
    const isBuildRoute = location.pathname === '/build';
    
    if (isBuildRoute) {
      root.classList.remove('dark');
      root.classList.add('light');
      console.log('ThemeInitializer: Applied light theme for /build');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      console.log('ThemeInitializer: Applied dark theme');
    }
  }, [location.pathname]);
  
  // Set data-theme attribute for user-specific theming
  useEffect(() => {
    if (user && resolvedTheme && !isLoading) {
      const isBuildRoute = location.pathname === '/build';
      const effectiveTheme = isBuildRoute ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      console.log(`ThemeInitializer: Set data-theme to ${effectiveTheme}`);
    }
  }, [user, resolvedTheme, isLoading, location.pathname]);
  
  return <>{children}</>;
};