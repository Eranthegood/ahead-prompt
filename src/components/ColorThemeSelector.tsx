import { useState } from 'react';
import { useColorTheme } from '@/hooks/useColorTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const ColorThemeSelector = () => {
  const { 
    currentTheme, 
    getAllThemes, 
    applyTheme, 
    createCustomTheme 
  } = useColorTheme();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [baseColor, setBaseColor] = useState('#3b82f6');

  const handleApplyTheme = (theme: any) => {
    applyTheme(theme);
    toast.success(`Theme "${theme.name}" applied successfully!`);
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    try {
      createCustomTheme(baseColor, newThemeName.trim());
      toast.success(`Custom theme "${newThemeName}" created and applied!`);
      setIsCreating(false);
      setNewThemeName('');
      setBaseColor('#3b82f6');
    } catch (error) {
      toast.error('Failed to create theme');
    }
  };

  const ColorPreview = ({ colors }: { colors: string[] }) => (
    <div className="flex gap-1 mb-2">
      {colors.map((color, index) => (
        <div
          key={index}
          className="w-4 h-4 rounded-sm border border-border"
          style={{ backgroundColor: `hsl(${color})` }}
        />
      ))}
    </div>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Theme Selector
        </CardTitle>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Theme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Theme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input
                  id="theme-name"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Enter theme name..."
                />
              </div>
              <div>
                <Label htmlFor="base-color">Base Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="base-color"
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTheme}>
                  Create Theme
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Available Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAllThemes().map((theme) => {
                const colors = [
                  theme.illustration1,
                  theme.illustration2,
                  theme.illustration3,
                  theme.illustration4,
                  theme.illustration5,
                ];
                
                return (
                  <div
                    key={theme.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      currentTheme.name === theme.name
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleApplyTheme(theme)}
                  >
                    <ColorPreview colors={colors} />
                    <p className="text-sm font-medium">{theme.name}</p>
                    {currentTheme.name === theme.name && (
                      <p className="text-xs text-muted-foreground">Current theme</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};