import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Terminal, Cloud } from 'lucide-react';

export function ClaudeSection() {
  const { 
    preferences, 
    saveClaudeCliModePreference, 
    saveClaudeCliEndpointPreference 
  } = useUserPreferences();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Claude Code Integration
          </CardTitle>
          <CardDescription>
            Configure how prompts are sent to Claude Code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="cli-mode" className="text-sm font-medium">
                CLI Local Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use local CLI server instead of Supabase Edge Functions
              </p>
            </div>
            <Switch
              id="cli-mode"
              checked={preferences.claudeCliMode}
              onCheckedChange={saveClaudeCliModePreference}
            />
          </div>

          {/* Mode indicators */}
          <div className="flex gap-2">
            <Badge 
              variant={preferences.claudeCliMode ? "outline" : "default"}
              className="flex items-center gap-1"
            >
              <Cloud className="h-3 w-3" />
              Supabase Mode
            </Badge>
            <Badge 
              variant={preferences.claudeCliMode ? "default" : "outline"}
              className="flex items-center gap-1"
            >
              <Terminal className="h-3 w-3" />
              CLI Local Mode
            </Badge>
          </div>

          {/* CLI Endpoint Configuration */}
          {preferences.claudeCliMode && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <Label htmlFor="cli-endpoint" className="text-sm font-medium">
                CLI Server Endpoint
              </Label>
              <Input
                id="cli-endpoint"
                type="url"
                value={preferences.claudeCliEndpoint}
                onChange={(e) => saveClaudeCliEndpointPreference(e.target.value)}
                placeholder="http://localhost:3001"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Make sure your local Claude CLI server is running on this endpoint
              </p>
            </div>
          )}

          {/* Information */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {preferences.claudeCliMode ? (
                <>
                  🔧 <strong>CLI Mode:</strong> Prompts will be sent directly to your local Claude CLI server. 
                  Make sure the server is running and accessible.
                </>
              ) : (
                <>
                  ☁️ <strong>Supabase Mode:</strong> Prompts will be processed through secure Supabase Edge Functions 
                  with full session tracking and real-time updates.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}