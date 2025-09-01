import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Moon, Sun, Monitor, Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGamification, PREMIUM_FEATURES } from '@/hooks/useGamification';
import { PremiumFeatureCard } from '@/components/PremiumFeatureCard';

export default function Settings() {
  const navigate = useNavigate();
  const { 
    theme, 
    setTheme, 
    isDarkModeUnlocked, 
    xpNeededForDarkMode, 
    currentLevel, 
    requiredLevel 
  } = useTheme();
  const { preferences, saveCompletedItemsPreference } = useUserPreferences();
  const { hasUnlockedFeature } = useGamification();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your application preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Premium Features Unlock Card */}
          {(!isDarkModeUnlocked || !hasUnlockedFeature('COMPACT_MODE')) && (
            <PremiumFeatureCard
              featureName="Mode Sombre Premium"
              requiredLevel={PREMIUM_FEATURES.DARK_MODE}
              isUnlocked={isDarkModeUnlocked}
              xpNeeded={xpNeededForDarkMode}
              currentLevel={currentLevel}
              icon={<Moon className="h-5 w-5 text-primary" />}
              description="Débloquez une interface élégante et moderne avec le mode sombre exclusif"
            />
          )}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Theme</Label>
                    {!isDarkModeUnlocked && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="mr-1 h-3 w-3" />
                        Niveau {requiredLevel} requis
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isDarkModeUnlocked 
                      ? "Choose your preferred theme" 
                      : `Atteignez le niveau ${requiredLevel} pour débloquer le mode sombre`
                    }
                  </p>
                  {!isDarkModeUnlocked && xpNeededForDarkMode > 0 && (
                    <p className="text-xs text-primary">
                      {xpNeededForDarkMode} XP restants (Niveau {currentLevel}/{requiredLevel})
                    </p>
                  )}
                </div>
                <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <SelectItem 
                            value="dark" 
                            disabled={!isDarkModeUnlocked}
                            className={!isDarkModeUnlocked ? "opacity-50" : ""}
                          >
                            <div className="flex items-center">
                              {!isDarkModeUnlocked ? (
                                <Lock className="mr-2 h-4 w-4" />
                              ) : (
                                <Moon className="mr-2 h-4 w-4" />
                              )}
                              Dark
                            </div>
                          </SelectItem>
                        </div>
                      </TooltipTrigger>
                      {!isDarkModeUnlocked && (
                        <TooltipContent>
                          <p>Atteignez le niveau {requiredLevel} pour débloquer</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <SelectItem 
                            value="system" 
                            disabled={!isDarkModeUnlocked}
                            className={!isDarkModeUnlocked ? "opacity-50" : ""}
                          >
                            <div className="flex items-center">
                              {!isDarkModeUnlocked ? (
                                <Lock className="mr-2 h-4 w-4" />
                              ) : (
                                <Monitor className="mr-2 h-4 w-4" />
                              )}
                              System
                            </div>
                          </SelectItem>
                        </div>
                      </TooltipTrigger>
                      {!isDarkModeUnlocked && (
                        <TooltipContent>
                          <p>Atteignez le niveau {requiredLevel} pour débloquer</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Compact Mode</Label>
                    {!hasUnlockedFeature('COMPACT_MODE') && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="mr-1 h-3 w-3" />
                        Niveau {PREMIUM_FEATURES.COMPACT_MODE} requis
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact interface
                  </p>
                </div>
                <Switch 
                  disabled={!hasUnlockedFeature('COMPACT_MODE')}
                  checked={preferences.compactMode && hasUnlockedFeature('COMPACT_MODE')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                Configure your workspace preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes as you type
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show completed items</Label>
                  <p className="text-sm text-muted-foreground">
                    Display completed prompts in the sidebar
                  </p>
                </div>
                <Switch 
                  checked={preferences.showCompletedItems}
                  onCheckedChange={saveCompletedItemsPreference}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable keyboard shortcuts</Label>
                  <p className="text-sm text-muted-foreground">
                    Use keyboard shortcuts for quick actions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Control when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications for important updates
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for activity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}