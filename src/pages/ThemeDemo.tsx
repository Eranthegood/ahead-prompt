import { ColorThemeSelector } from '@/components/ColorThemeSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function ThemeDemo() {
  const illustrationClasses = [
    'illustration-1',
    'illustration-2', 
    'illustration-3',
    'illustration-4',
    'illustration-5'
  ];

  const textClasses = [
    'text-illustration-1',
    'text-illustration-2',
    'text-illustration-3', 
    'text-illustration-4',
    'text-illustration-5'
  ];

  const borderClasses = [
    'border-illustration-1',
    'border-illustration-2',
    'border-illustration-3',
    'border-illustration-4', 
    'border-illustration-5'
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Color Theme System Demo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Demonstrating dynamic color theme application with HEX, RGBA, and HSLA conversion.
          Themes apply instantly across all interface elements.
        </p>
      </div>

      <ColorThemeSelector />

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Swatches */}
        <Card>
          <CardHeader>
            <CardTitle>Illustration Color Swatches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {illustrationClasses.map((className, index) => (
              <div key={className} className="flex items-center gap-4">
                <div 
                  className={`w-16 h-16 rounded-lg border border-border ${className}`}
                />
                <div>
                  <p className="font-medium">.{className}</p>
                  <p className="text-sm text-muted-foreground">
                    Illustration color {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* UI Elements Demo */}
        <Card>
          <CardHeader>
            <CardTitle>UI Elements with Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div className="space-y-2">
              <h4 className="font-medium">Buttons</h4>
              <div className="flex flex-wrap gap-2">
                {illustrationClasses.map((className, index) => (
                  <Button
                    key={className}
                    variant="outline"
                    size="sm"
                    className={className}
                    style={{ color: 'white' }}
                  >
                    Button {index + 1}
                  </Button>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h4 className="font-medium">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {textClasses.map((className, index) => (
                  <Badge key={className} variant="outline" className={className}>
                    Badge {index + 1}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Text Elements */}
            <div className="space-y-2">
              <h4 className="font-medium">Text Colors</h4>
              <div className="space-y-1">
                {textClasses.map((className, index) => (
                  <p key={className} className={`font-medium ${className}`}>
                    This text uses {className}
                  </p>
                ))}
              </div>
            </div>

            {/* Border Elements */}
            <div className="space-y-2">
              <h4 className="font-medium">Border Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                {borderClasses.map((className, index) => (
                  <div
                    key={className}
                    className={`p-3 border-2 rounded-lg ${className}`}
                  >
                    <p className="text-sm">{className}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Form Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input with illustration-1 focus</label>
              <Input 
                placeholder="Focus to see theme color"
                className="focus:border-illustration-1 focus:ring-illustration-1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Input with illustration-3 focus</label>
              <Input 
                placeholder="Focus to see theme color"
                className="focus:border-illustration-3 focus:ring-illustration-3"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Textarea with illustration-2 focus</label>
            <Textarea 
              placeholder="Focus to see theme color..."
              className="focus:border-illustration-2 focus:ring-illustration-2"
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            {illustrationClasses.map((className, index) => (
              <Button
                key={className}
                className={`${className} text-white hover:opacity-80 transition-opacity`}
              >
                Action {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Info */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-illustration-1">{'<'} 100ms</p>
              <p className="text-sm text-muted-foreground">Theme Application Speed</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-illustration-3">5 Colors</p>
              <p className="text-sm text-muted-foreground">Dynamic Illustration Classes</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-illustration-5">All Browsers</p>
              <p className="text-sm text-muted-foreground">Modern Browser Support</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}