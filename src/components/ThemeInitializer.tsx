import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { resolvedTheme, isLoading } = useTheme();
  
  // Ensure light mode is applied immediately on mount
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('light') && !root.classList.contains('dark')) {
      root.classList.add('light');
      console.log('ThemeInitializer: Applied default light theme');
    }
  }, []);
  
  // The useTheme hook handles all theme initialization automatically
  // This component ensures the theme system is active when the user is authenticated
  useEffect(() => {
    if (user && resolvedTheme && !isLoading) {
      // Theme system is now active and working
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      console.log(`ThemeInitializer: Set data-theme to ${resolvedTheme}`);
    }
  }, [user, resolvedTheme, isLoading]);
  
  return <>{children}</>;
};