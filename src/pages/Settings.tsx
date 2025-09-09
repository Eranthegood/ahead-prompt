import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Moon, Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGamification, PREMIUM_FEATURES } from '@/hooks/useGamification';
import { PremiumFeatureCard } from '@/components/PremiumFeatureCard';
export default function Settings() {
  const navigate = useNavigate();
  const {
    preferences,
    saveCompletedItemsPreference,
    saveAutoSavePreference,
    savePromptCardModePreference
  } = useUserPreferences();
  const {
    hasUnlockedFeature
  } = useGamification();
  return <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 -ml-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your application preferences</p>
      </div>

        <div className="grid gap-6">
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
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact interface
                  </p>
                </div>
                <Switch checked={preferences.compactMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Promptcard: Minimalist</Label>
                  <p className="text-sm text-muted-foreground">
                    Display prompts in a clean, horizontal layout with essential info only
                  </p>
                </div>
                <Switch 
                  checked={preferences.promptCardMode === 'minimalist'} 
                  onCheckedChange={(checked) => savePromptCardModePreference(checked ? 'minimalist' : 'default')} 
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
                    Automatically save changes when you stop typing (disabled by default for better UX)
                  </p>
                </div>
                <Switch 
                  checked={preferences.autoSaveEnabled} 
                  onCheckedChange={saveAutoSavePreference} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show completed items</Label>
                  <p className="text-sm text-muted-foreground">
                    Display completed prompts in the sidebar
                  </p>
                </div>
                <Switch checked={preferences.showCompletedItems} onCheckedChange={saveCompletedItemsPreference} />
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
      </div>;
}