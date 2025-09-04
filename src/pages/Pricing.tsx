import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Check, Zap, Sparkles, Gift } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";

export default function Pricing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/build');
  };

  const features = [
    "Unlimited prompt storage",
    "Smart AI prompt generation", 
    "One-click copy to any AI tool",
    "Kanban workflow organization",
    "Keyboard shortcuts for speed",
    "Multi-product organization",
    "Knowledge base integration",
    "GitHub & Cursor integration",
    "Dark/light theme support",
    "Export your data anytime"
  ];

  return (
    <div className="min-h-screen bg-background">
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
          <BlurFade delay={0.1} inView>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Special Launch Offer
            </div>
          </BlurFade>

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

          {/* Free Plan Card */}
          <BlurFade delay={0.6} inView>
            <div className="max-w-md mx-auto mt-12">
              <div className="relative p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Forever Free
                  </div>
                </div>
                
                <div className="text-center space-y-6 mt-4">
                  <div>
                    <div className="text-6xl font-bold text-primary mb-2">$0</div>
                    <div className="text-muted-foreground">No catch, no limits</div>
                  </div>

                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    className="w-full px-8 py-6 text-lg font-medium group"
                  >
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <div className="space-y-4 text-left">
                    <div className="font-semibold text-foreground mb-3">Everything included:</div>
                    <div className="grid gap-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Why Free Section */}
          <BlurFade delay={0.8} inView>
            <div className="mt-16 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Why is Ahead free?</h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Built by developers, for developers</h3>
                  <p className="text-sm text-muted-foreground">
                    We know the pain of losing momentum. This tool solves our own problem.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Speed over profit</h3>
                  <p className="text-sm text-muted-foreground">
                    We want every developer to ship faster. Making it free removes all friction.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Community-driven growth</h3>
                  <p className="text-sm text-muted-foreground">
                    The best products are built with user feedback, not paywalls.
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* CTA Section */}
          <BlurFade delay={1.0} inView>
            <div className="mt-16 p-8 rounded-2xl bg-muted/30 border">
              <h3 className="text-xl font-semibold mb-4">Ready to stay 3 moves ahead?</h3>
              <p className="text-muted-foreground mb-6">
                Join developers who never lose their creative momentum again.
              </p>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 py-6 text-lg font-medium group"
              >
                Start Your Free Journey
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </BlurFade>
        </div>
      </main>
    </div>
  );
}