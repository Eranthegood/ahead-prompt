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
      label: 'Sombre',
      description: 'Interface sombre pour moins de fatigue oculaire',
      icon: Moon,
    },
    {
      id: 'system' as const,
      label: 'Système',
      description: 'Suit les préférences de votre système',
      icon: Monitor,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thème</CardTitle>
          <CardDescription>
            Choisissez l'apparence de l'interface qui vous convient le mieux.
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
          <CardTitle>Personnalisation</CardTitle>
          <CardDescription>
            Autres options d'apparence (bientôt disponibles).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Mode compact</div>
                <div className="text-sm text-muted-foreground">
                  Interface plus dense avec moins d'espacement
                </div>
              </div>
              <Button variant="outline" disabled>
                Bientôt
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Couleur d'accent</div>
                <div className="text-sm text-muted-foreground">
                  Personnalisez la couleur principale de l'interface
                </div>
              </div>
              <Button variant="outline" disabled>
                Bientôt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}