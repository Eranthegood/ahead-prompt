import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useBuildTheme = () => {
  const location = useLocation();
  
  const isBuildRoute = location.pathname === '/build';
  
  useEffect(() => {
    const root = document.documentElement;
    
    if (isBuildRoute) {
      // Apply light mode for build route
      root.classList.remove('dark');
      root.classList.add('light');
      console.log('Applied light theme for /build route');
    } else {
      // Apply dark mode for all other routes
      root.classList.remove('light');
      root.classList.add('dark');
      console.log('Applied dark theme for non-build route');
    }
  }, [isBuildRoute, location.pathname]);
  
  return {
    isBuildRoute,
    theme: isBuildRoute ? 'light' : 'dark'
  };
};