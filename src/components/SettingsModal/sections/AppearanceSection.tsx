import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: 'dark' as const,
      label: 'Dark',
      description: 'Dark interface for reduced eye strain',
      icon: Moon,
    },
    {
      id: 'system' as const,
      label: 'System',
      description: 'Follow your system preferences',
      icon: Monitor,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose the interface appearance that suits you best.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.id;
              
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    "flex flex-col h-auto p-4 space-y-2",
                    isActive && "ring-2 ring-primary bg-accent"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customization</CardTitle>
          <CardDescription>
            Other appearance options (coming soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Compact mode</div>
                <div className="text-sm text-muted-foreground">
                  Denser interface with less spacing
                </div>
              </div>
              <Button variant="outline" disabled>
                Soon
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Accent color</div>
                <div className="text-sm text-muted-foreground">
                  Customize the main interface color
                </div>
              </div>
              <Button variant="outline" disabled>
                Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}