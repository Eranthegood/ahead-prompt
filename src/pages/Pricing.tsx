import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Check, Zap, Sparkles, Gift } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
export default function Pricing() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const handleGetStarted = () => {
    navigate('/build');
  };
  const handlePricingFeedback = async (pricePoint: string) => {
    if (submitting) return;
    setSubmitting(true);
    setSelectedPrice(pricePoint);
    try {
      const {
        error
      } = await supabase.from('pricing_feedback').insert({
        user_id: user?.id || null,
        email: user?.email || null,
        price_point: pricePoint,
        feedback_type: 'pricing_interest',
        user_agent: navigator.userAgent
      });
      if (error) throw error;
      toast.success(`Thanks for your feedback! We've noted your interest in ${pricePoint}`);
    } catch (error) {
      console.error('Error submitting pricing feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
      setSelectedPrice(null);
    } finally {
      setSubmitting(false);
    }
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


          {/* Pricing Feedback Section */}
          <BlurFade delay={0.8} inView>
            <div className="max-w-2xl mx-auto mt-16 p-8 border border-border rounded-lg bg-card/50">
              <div className="text-center space-y-6">
                
                <p className="text-muted-foreground">
                  Give us some hint for the most fair pricing you&apos;re ready to buy
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <Button variant={selectedPrice === "$5/mo" ? "default" : "outline"} className="h-12" onClick={() => handlePricingFeedback("$5/mo")} disabled={submitting}>
                    $5/mo
                  </Button>
                  
                  <Button variant={selectedPrice === "$15/mo" ? "default" : "outline"} className="h-12" onClick={() => handlePricingFeedback("$15/mo")} disabled={submitting}>
                    $15/mo
                  </Button>

                  <Button variant={selectedPrice === "$15/mo Pro Advance" ? "default" : "outline"} className="h-12 flex flex-col items-center justify-center" onClick={() => handlePricingFeedback("$15/mo Pro Advance")} disabled={submitting}>
                    <span className="text-sm font-semibold">$15/mo</span>
                    <span className="text-xs text-muted-foreground">Pro Advance</span>
                  </Button>
                  
                </div>
                <p className="text-sm text-muted-foreground">
                  And once ready, you will receive a special offer
                </p>
              </div>
            </div>
          </BlurFade>
        </div>
      </main>
    </div>;
}