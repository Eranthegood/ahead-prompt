import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Check, Zap, Sparkles, Gift } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
export default function Pricing() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/build');
  };
  const features = ["Unlimited prompt storage", "Smart AI prompt generation", "One-click copy to any AI tool", "Kanban workflow organization", "Keyboard shortcuts for speed", "Multi-product organization", "Knowledge base integration", "GitHub & Cursor integration", "Dark/light theme support", "Export your data anytime"];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="hover:text-primary">
            ← Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          <BlurFade delay={0.25} inView>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Enjoy this tool for{" "}
              <span className="text-primary relative">
                free
                <Heart className="w-6 h-6 md:w-8 md:h-8 absolute -top-2 -right-8 text-red-500 fill-red-500" />
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're building this for developers who want to stay ahead. 
              No paywalls, no limits, just pure productivity.
            </p>
          </BlurFade>

          <BlurFade delay={0.6} inView>
            <div className="max-w-md mx-auto mt-12 p-8 border border-border rounded-lg bg-card">
              <div className="text-center space-y-6">
                <Gift className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-2xl font-semibold">Always Free</h3>
                <p className="text-muted-foreground">
                  Everything you need to supercharge your development workflow.
                </p>
                <Button onClick={handleGetStarted} className="w-full">
                  Start Building <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </BlurFade>
        </div>
      </main>
    </div>;
}