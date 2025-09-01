import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Zap, Code, Layers } from "lucide-react";
export default function LandingPage() {
  const {
    signInWithGoogle
  } = useAuth();
  const handleGetStarted = async () => {
    await signInWithGoogle();
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono text-xl font-bold text-primary">
            Vibe Plan Forge
          </div>
          <Button variant="ghost" onClick={handleGetStarted} className="text-sm hover:text-primary">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Ship AI Features
              <br />
              <span className="text-primary">Faster</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The prompt management platform for developers who build with AI.
              <br />
              Organize, version, and deploy like code.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={handleGetStarted} className="px-8 py-6 text-lg font-medium group">
              Start Building
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/10">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Organize by Product</h3>
              <p className="text-sm text-muted-foreground">
                Structure prompts in epics and products like your codebase
              </p>
            </div>
            
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Version Control</h3>
              <p className="text-sm text-muted-foreground">
                Track changes and iterate on prompts like you do with code
              </p>
            </div>
            
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Keyboard First</h3>
              <p className="text-sm text-muted-foreground">
                Built for speed with shortcuts and efficient workflows
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built for developers, by developers. Start shipping AI features today.
          </p>
        </div>
      </footer>
    </div>;
}