import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  
  // The useTheme hook handles all theme initialization automatically
  // This component ensures the theme system is active when the user is authenticated
  useEffect(() => {
    if (user && resolvedTheme) {
      // Theme system is now active and working
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }
  }, [user, resolvedTheme]);
  
  return <>{children}</>;
};