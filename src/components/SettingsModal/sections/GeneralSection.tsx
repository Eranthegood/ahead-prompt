import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function GeneralSection() {
  const { preferences, saveAutoSavePreference, saveGamificationPreference } = useUserPreferences();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Préférences générales</CardTitle>
          <CardDescription>
            Configurez le comportement général de l'application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">
                Sauvegarde automatiquement vos modifications
              </p>
            </div>
            <Switch
              checked={preferences.autoSaveEnabled}
              onCheckedChange={saveAutoSavePreference}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gamification</Label>
              <p className="text-sm text-muted-foreground">
                Affiche les points XP et les achievements
              </p>
            </div>
            <Switch
              checked={preferences.gamificationEnabled}
              onCheckedChange={saveGamificationPreference}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Gérez vos préférences de notifications (bientôt disponible).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notifications email</div>
                <div className="text-sm text-muted-foreground">
                  Recevoir des notifications par email
                </div>
              </div>
              <Switch disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notifications push</div>
                <div className="text-sm text-muted-foreground">
                  Notifications dans le navigateur
                </div>
              </div>
              <Switch disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}