import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Check, Zap, Sparkles, Gift } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePricingTracking } from "@/hooks/usePricingTracking";
import { getPriceId, getAnnualPrice } from "@/constants/subscriptionPlans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { trackPricingInteraction, isTracking } = usePricingTracking();
  
  const handleGetStarted = () => {
    navigate('/build');
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      navigate('/auth');
      return;
    }

    const priceId = getPriceId(planId, isAnnual);
    if (!priceId) {
      toast.error("Price not found for this plan");
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to start checkout process");
    } finally {
      setIsLoading(false);
    }
  };

  const pricingTiers = [
    {
      planId: "pro",
      name: "Pro",
      description: "For teams & power users",
      monthlyPrice: 15,
      yearlyPrice: 144, // 15 * 12 * 0.8 (20% discount)
      features: [
        "Unlimited prompts",
        "Unlimited products", 
        "Unlimited epics",
        "Unlimited prompt library",
        "Knowledge base access",
        "Advanced AI models",
        "Cursor integration",
        "Prompt enhancer (coming soon)",
        "2 collaboration seats",
        "Premium support"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      planId: "free",
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Unlimited prompts",
        "1 product",
        "3 epics total",
        "10 prompts in library",
        "Basic AI generation",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      planId: "basic",
      name: "Basic",
      description: "For growing projects",
      monthlyPrice: 5,
      yearlyPrice: 48, // 5 * 12 * 0.8 (20% discount)
      features: [
        "Unlimited prompts", 
        "3 products",
        "3 epics per product",
        "50 prompts in library",
        "Knowledge base access",
        "Advanced AI models",
        "Cursor integration",
        "Priority support"
      ],
      cta: "Upgrade to Basic", 
      popular: false
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


          {/* Feedback Section */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 mb-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Would you pay for this?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Help us shape the perfect pricing by choosing the plan you'd actually use. 
                Once ready, we'll send you a special offer to thank you for your feedback!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (user) {
                      handleUpgrade('pro');
                    } else {
                      trackPricingInteraction('pro');
                    }
                  }}
                  disabled={isTracking || isLoading}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {user ? "Upgrade to Pro" : "I'd pay for Pro"}
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-background/50 hover:bg-background/80"
                  onClick={() => {
                    if (user) {
                      handleGetStarted();
                    } else {
                      trackPricingInteraction('free');
                    }
                  }}
                  disabled={isTracking}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {user ? "Start Free" : "I'd use Free"}
                </Button>
                <Button 
                  variant="outline"
                  className="bg-background/50 hover:bg-background/80"
                  onClick={() => {
                    if (user) {
                      handleUpgrade('basic');
                    } else {
                      trackPricingInteraction('basic');
                    }
                  }}
                  disabled={isTracking || isLoading}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {user ? "Upgrade to Basic" : "I'd pay for Basic"}
                </Button>
              </div>
            </div>
          </div>

          {/* Pricing Toggle */}
          <BlurFade delay={0.6} inView>
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={!isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>
                Annual {isAnnual && <span className="text-xs text-muted-foreground">(billed annually)</span>} <Badge variant="secondary" className="ml-2">-20%</Badge>
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
                        ${isAnnual ? Math.floor(tier.yearlyPrice / 12) : tier.monthlyPrice}
                        <span className="text-base font-normal text-muted-foreground">/mo</span>
                      </div>
                      {isAnnual && tier.yearlyPrice > 0 && (
                        <div className="text-sm text-muted-foreground">
                          ${tier.yearlyPrice}/year (save 20%)
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
                      onClick={() => {
                        if (tier.planId === "free") {
                          handleGetStarted();
                        } else {
                          handleUpgrade(tier.planId);
                        }
                      }}
                      disabled={tier.planId !== "free" && (isLoading || isTracking)}
                    >
                      {isLoading && tier.planId !== "free" ? "Loading..." : tier.cta}
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