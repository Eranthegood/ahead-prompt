import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Check, Zap, Sparkles, Gift } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  
  const handleGetStarted = () => {
    navigate('/build');
  };

  const pricingTiers = [
    {
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Unlimited prompts",
        "1 workspace",
        "Basic AI generation",
        "Community support",
        "Export data"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Basic",
      description: "For solo developers",
      monthlyPrice: 5,
      yearlyPrice: 48, // 5 * 12 * 0.8
      features: [
        "Unlimited prompts", 
        "3 workspaces",
        "Advanced AI generation",
        "GitHub integration",
        "Priority support",
        "Keyboard shortcuts",
        "Knowledge base"
      ],
      cta: "Upgrade to Basic", 
      popular: false
    },
    {
      name: "Pro",
      description: "For power users & teams",
      monthlyPrice: 15,
      yearlyPrice: 144, // 15 * 12 * 0.8
      features: [
        "Unlimited prompts",
        "Unlimited workspaces", 
        "All AI features",
        "All integrations",
        "Team collaboration",
        "Advanced analytics",
        "Custom templates",
        "Premium support"
      ],
      cta: "Upgrade to Pro",
      popular: true
    }
  ];

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


          {/* Pricing Toggle */}
          <BlurFade delay={0.6} inView>
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={!isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>
                Annual <Badge variant="secondary" className="ml-2">-20%</Badge>
              </span>
            </div>
          </BlurFade>

          {/* Pricing Cards */}
          <BlurFade delay={0.8} inView>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <Card key={tier.name} className={`relative ${tier.popular ? 'ring-2 ring-primary scale-105' : ''}`}>
                  {tier.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="py-4">
                      <div className="text-3xl font-bold">
                        €{isAnnual ? Math.floor(tier.yearlyPrice / 12) : tier.monthlyPrice}
                        <span className="text-base font-normal text-muted-foreground">/mo</span>
                      </div>
                      {isAnnual && tier.yearlyPrice > 0 && (
                        <div className="text-sm text-muted-foreground">
                          €{tier.yearlyPrice}/year (save 20%)
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => tier.name === "Free" ? handleGetStarted() : toast.info("Payment integration coming soon!")}
                    >
                      {tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </BlurFade>
        </div>
      </main>
    </div>;
}