import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Zap, Target } from 'lucide-react';

export default function PromptEnhancerComingSoon() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Prompt Enhancer</h1>
          <Badge variant="secondary" className="text-xs">Soon</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          We're building something incredible to enhance your AI prompts
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Intelligent Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Transform your raw ideas into optimized prompts with our advanced AI that understands context and best practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Specialized Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Access a library of pre-built templates for different use cases: code, design, marketing, and more.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Continuous Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Analyze your prompt performance and receive improvement suggestions based on real results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Team Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Share your best prompts with your team and build together a library of effective prompts.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Prompt Enhancer is currently in intensive development. This revolutionary feature will soon be available to all our users.
            </p>
            <p className="text-sm text-muted-foreground">
              Stay tuned to be among the first to try it!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}