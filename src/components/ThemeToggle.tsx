import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggle = () => {
  const { effectiveTheme, setTheme, canChangeTheme } = useTheme();

  if (!canChangeTheme) {
    return null; // Only show on /build route
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(effectiveTheme === 'light' ? 'dark' : 'light')}
      className="h-8 w-8 p-0"
    >
      {effectiveTheme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
};