import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { description: 'Ouvrir la palette de commandes', keys: ['Ctrl', 'K'] },
      { description: 'Aller à l\'accueil', keys: ['G', 'H'] },
      { description: 'Aller aux produits', keys: ['G', 'P'] },
      { description: 'Rechercher', keys: ['Ctrl', '/'] },
    ],
  },
  {
    category: 'Prompts',
    items: [
      { description: 'Nouveau prompt', keys: ['N', 'P'] },
      { description: 'Nouveau prompt rapide', keys: ['Ctrl', 'Shift', 'N'] },
      { description: 'Copier le prompt sélectionné', keys: ['Ctrl', 'C'] },
      { description: 'Supprimer le prompt', keys: ['Del'] },
    ],
  },
  {
    category: 'Epics',
    items: [
      { description: 'Nouvel epic', keys: ['N', 'E'] },
      { description: 'Epic rapide', keys: ['Ctrl', 'Shift', 'E'] },
    ],
  },
  {
    category: 'Interface',
    items: [
      { description: 'Basculer le thème', keys: ['Ctrl', 'Shift', 'T'] },
      { description: 'Ouvrir les paramètres', keys: ['Ctrl', ','] },
      { description: 'Fermer modal/dialog', keys: ['Escape'] },
    ],
  },
];

export function ShortcutsSection() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const formatKey = (key: string) => {
    if (isMac) {
      return key.replace('Ctrl', '⌘').replace('Alt', '⌥').replace('Shift', '⇧');
    }
    return key;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Raccourcis clavier</CardTitle>
          <CardDescription>
            Tous les raccourcis disponibles pour une navigation rapide.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {shortcuts.map((category, categoryIndex) => (
              <div key={category.category}>
                <h3 className="font-semibold text-foreground mb-3">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Badge key={keyIndex} variant="outline" className="font-mono text-xs">
                            {formatKey(key)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {categoryIndex < shortcuts.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personnalisation</CardTitle>
          <CardDescription>
            Personnalisez vos raccourcis clavier (bientôt disponible).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              La personnalisation des raccourcis sera bientôt disponible.
            </p>
            <Button disabled variant="outline">
              Configurer les raccourcis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}