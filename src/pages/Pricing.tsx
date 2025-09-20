import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Check, Zap, Sparkles, Gift, AlertCircle } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePricingTracking } from "@/hooks/usePricingTracking";
import { getPriceId, getAnnualPrice } from "@/constants/subscriptionPlans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("Early"); // Default to "Early" coupon
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const { trackPricingInteraction, isTracking } = usePricingTracking();
  
  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleUpgrade = async (planId: string) => {
    console.log('[PRICING] handleUpgrade called with planId:', planId, 'isAnnual:', isAnnual);
    
    if (!user) {
      // Pass plan information via URL parameters for unauthenticated users
      const params = new URLSearchParams({
        plan: planId,
        billing: isAnnual ? 'annual' : 'monthly'
      });
      navigate(`/auth?${params.toString()}`);
      return;
    }

    const priceId = getPriceId(planId, isAnnual);
    console.log('[PRICING] getPriceId result:', priceId, 'for plan:', planId);
    
    if (!priceId) {
      console.error('[PRICING] No price ID found for plan:', planId);
      toast.error("Price not found for this plan");
      return;
    }

    setIsLoading(true);
    setCouponError("");
    setCouponSuccess("");
    
    try {
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        throw new Error('No active session');
      }

      const requestBody: { priceId: string; couponId?: string } = { priceId };
      if (couponCode.trim()) {
        requestBody.couponId = couponCode.trim();
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        if (couponCode.trim()) {
          setCouponSuccess(`Coupon "${couponCode}" applied successfully!`);
        }
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.message || "Failed to start checkout process. Please try again.";
      
      if (errorMessage.includes("Invalid coupon") || errorMessage.includes("coupon")) {
        setCouponError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
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
              Pricing{" "}
              <span className="text-primary relative">
                for everyone
                <Heart className="w-6 h-6 md:w-8 md:h-8 absolute -top-2 -right-8 text-red-500 fill-red-500" />
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're building this for developers who want to stay ahead. 
              Just pure productivity.
            </p>
          </BlurFade>



          {/* Pricing Toggle */}
          <BlurFade delay={0.6} inView>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={!isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>
                Annual {isAnnual && <span className="text-xs text-muted-foreground">(billed annually)</span>} <Badge variant="secondary" className="ml-2">-20%</Badge>
              </span>
            </div>
          </BlurFade>

          {/* Coupon Code Input */}
          <BlurFade delay={0.7} inView>
            <div className="max-w-md mx-auto space-y-3 mb-8">
              <div className="text-center">
                <Label htmlFor="coupon-code" className="text-sm font-medium">
                  Coupon Code (Optional)
                </Label>
              </div>
              <div className="flex flex-col space-y-2">
                <Input
                  id="coupon-code"
                  placeholder="Enter coupon code (e.g., Early)"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError("");
                    setCouponSuccess("");
                  }}
                  className="text-center"
                />
                {couponError && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-600 dark:text-red-400">
                      {couponError}
                    </AlertDescription>
                  </Alert>
                )}
                {couponSuccess && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      {couponSuccess}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
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
                        {tier.planId !== "free" && couponCode && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Gift className="w-3 h-3 mr-1" />
                              Extra 30% off with "{couponCode}"
                            </Badge>
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

          {/* Refund Policy Link */}
          <BlurFade delay={1.0} inView>
            <div className="text-center mt-8">
              <Button 
                variant="link" 
                onClick={() => navigate('/refund-policy')}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancellation and Refund Policy
              </Button>
            </div>
          </BlurFade>

          {/* FAQ Section */}
          <BlurFade delay={1.2} inView>
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <Card className="max-w-3xl mx-auto">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="free">
                      <AccordionTrigger>Why Ahead is not completely free?</AccordionTrigger>
                      <AccordionContent>
                        As we support API costs for prompt generation, we try to cover our costs.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="limits">
                      <AccordionTrigger>How do the plan limits work?</AccordionTrigger>
                      <AccordionContent>
                        <p>Basic and Pro plans will have access to more features such as:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Knowledge Box</li>
                          <li>Prompt enhancer</li>
                          <li>Biggest library</li>
                          <li>Team collaboration</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cancel">
                      <AccordionTrigger>Can I cancel my subscription?</AccordionTrigger>
                      <AccordionContent>
                        Anytime! No questions asked.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="refund">
                      <AccordionTrigger>Can I have a refund for my annual subscription?</AccordionTrigger>
                      <AccordionContent>
                        Yes, within 30 days after your payment.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="users">
                      <AccordionTrigger>How many users can I onboard on my Pro subscription?</AccordionTrigger>
                      <AccordionContent>
                        You can add 2 teammates. If you need more, send us a message to setup a proper company workspace.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="integrations">
                      <AccordionTrigger>Does Ahead support integrations?</AccordionTrigger>
                      <AccordionContent>
                        Yes, Cursor, Claude, Figma and GitHub.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="team">
                      <AccordionTrigger>Who is the team behind Ahead?</AccordionTrigger>
                      <AccordionContent>
                        Jérémy. I'm alone working on this project.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </BlurFade>
        </div>
      </main>
    </div>;
}