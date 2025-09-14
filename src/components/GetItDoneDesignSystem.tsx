import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Circle } from 'lucide-react';

/**
 * Get It Done Design System Showcase
 * Demonstrates the complete Todoist-inspired minimalist design system
 */
export const GetItDoneDesignSystem: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Get It Done Design System</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern, minimalist design system inspired by Todoist. Featuring high contrast but soft colors, 
          generous spacing, and clear hierarchy for maximum productivity.
        </p>
      </div>

      {/* Color Palette */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <p className="text-sm text-muted-foreground">
            Dominant neutral grays with targeted color accents. All colors meet WCAG AA+ contrast standards.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h3 className="font-semibold mb-3">Primary & Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 w-full bg-primary rounded-lg shadow-sm"></div>
                <p className="text-xs font-medium">Primary Red</p>
                <p className="text-xs text-muted-foreground">hsl(4, 90%, 58%)</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full bg-primary-muted rounded-lg shadow-sm"></div>
                <p className="text-xs font-medium">Primary Muted</p>
                <p className="text-xs text-muted-foreground">hsl(4, 45%, 88%)</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full bg-secondary rounded-lg shadow-sm border"></div>
                <p className="text-xs font-medium">Secondary Gray</p>
                <p className="text-xs text-muted-foreground">hsl(0, 0%, 96%)</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full bg-muted rounded-lg shadow-sm border"></div>
                <p className="text-xs font-medium">Muted (25% Gray)</p>
                <p className="text-xs text-muted-foreground">hsl(0, 0%, 96%)</p>
              </div>
            </div>
          </div>

          {/* Status Colors */}
          <div>
            <h3 className="font-semibold mb-3">Task Status Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 w-full bg-status-todo rounded-lg shadow-sm border"></div>
                <p className="text-xs font-medium">Todo</p>
                <p className="text-xs text-muted-foreground">Light Gray</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full bg-status-progress rounded-lg shadow-sm"></div>
                <p className="text-xs font-medium">In Progress</p>
                <p className="text-xs text-muted-foreground">Orange</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full bg-status-generating rounded-lg shadow-sm"></div>
                <p className="text-xs font-medium">Generating</p>
                <p className="text-xs text-muted-foreground">Blue</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full bg-status-done rounded-lg shadow-sm"></div>
                <p className="text-xs font-medium">Done</p>
                <p className="text-xs text-muted-foreground">Green</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Hierarchy */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle>Typography Hierarchy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Clear hierarchy with generous spacing and high readability. Optimized for productivity apps.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1 - Main Titles</h1>
            <h2 className="text-2xl font-semibold">Heading 2 - Section Headers</h2>
            <h3 className="text-xl font-medium">Heading 3 - Subsections</h3>
            <h4 className="text-lg font-medium">Heading 4 - Minor Headings</h4>
            <p className="text-base">
              Body text with excellent readability. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-sm text-muted-foreground">
              Muted text for secondary information and subtle details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
          <p className="text-sm text-muted-foreground">
            All interactive elements meet the 44px minimum touch target for mobile accessibility.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="font-semibold mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>

          {/* Status Badges */}
          <div>
            <h3 className="font-semibold mb-3">Status Indicators</h3>
            <div className="flex flex-wrap gap-3">
              <div className="status-indicator status-todo">
                <Circle className="h-3 w-3" />
                Todo
              </div>
              <div className="status-indicator status-progress">
                <Clock className="h-3 w-3" />
                In Progress
              </div>
              <div className="status-indicator status-done">
                <CheckCircle className="h-3 w-3" />
                Done
              </div>
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Badge Style
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing System */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle>Spacing System</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generous spacing for clarity and breathing room. Based on 0.5rem increments.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="spacing-xs bg-muted rounded border-l-4 border-primary">
              <p className="text-sm font-medium">XS Spacing (0.5rem)</p>
            </div>
            <div className="spacing-sm bg-muted rounded border-l-4 border-primary">
              <p className="text-sm font-medium">SM Spacing (0.75rem)</p>
            </div>
            <div className="spacing-md bg-muted rounded border-l-4 border-primary">
              <p className="text-sm font-medium">MD Spacing (1rem)</p>
            </div>
            <div className="spacing-lg bg-muted rounded border-l-4 border-primary">
              <p className="text-sm font-medium">LG Spacing (1.5rem)</p>
            </div>
            <div className="spacing-xl bg-muted rounded border-l-4 border-primary">
              <p className="text-sm font-medium">XL Spacing (2rem)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Elevations */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle>Card Elevations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Subtle shadows for depth without overwhelming the minimal aesthetic.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="elevation-1 p-4 bg-card rounded-lg">
              <h4 className="font-medium mb-2">Elevation 1</h4>
              <p className="text-sm text-muted-foreground">Subtle shadow for basic cards</p>
            </div>
            <div className="elevation-2 p-4 bg-card rounded-lg">
              <h4 className="font-medium mb-2">Elevation 2</h4>
              <p className="text-sm text-muted-foreground">Medium shadow for important elements</p>
            </div>
            <div className="elevation-3 p-4 bg-card rounded-lg">
              <h4 className="font-medium mb-2">Elevation 3</h4>
              <p className="text-sm text-muted-foreground">Higher shadow for modals and overlays</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Example */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle>Interactive Example</CardTitle>
          <p className="text-sm text-muted-foreground">
            Hover over elements to see the interactive states in action.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="interactive-element p-4 bg-card rounded-lg border cursor-pointer">
              <h4 className="font-medium mb-2">Interactive Card</h4>
              <p className="text-sm text-muted-foreground">Hover me to see the lift effect</p>
            </div>
            <div className="interactive-element p-4 bg-card rounded-lg border cursor-pointer">
              <h4 className="font-medium mb-2">Another Card</h4>
              <p className="text-sm text-muted-foreground">Clean hover states for better UX</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Philosophy */}
      <Card className="elevation-3">
        <CardHeader>
          <CardTitle>Design Philosophy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Principles</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Clarity:</strong> High contrast, readable typography</li>
                <li>• <strong>Minimalism:</strong> Clean, uncluttered interface</li>
                <li>• <strong>Efficiency:</strong> Optimized for productivity workflows</li>
                <li>• <strong>Accessibility:</strong> WCAG AA+ compliance</li>
                <li>• <strong>Mobile-first:</strong> 44px+ touch targets</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Color Strategy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Neutral dominance:</strong> Grays for 90% of interface</li>
                <li>• <strong>Targeted accents:</strong> Red only for actions/status</li>
                <li>• <strong>25% gray rule:</strong> Soft contrast without harsh whites</li>
                <li>• <strong>Semantic colors:</strong> Status-specific color coding</li>
                <li>• <strong>HSL format:</strong> Consistent, adjustable color system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetItDoneDesignSystem;