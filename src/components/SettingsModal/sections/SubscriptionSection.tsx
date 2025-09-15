import { useSubscription, getPlanDisplayName } from "@/hooks/useSubscription";
import { PlanBadge } from "@/components/ui/plan-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUpRight, CreditCard, Calendar, Loader2, RefreshCw, Star, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_PLANS, getPlanByProductId, getPriceId, getAnnualPrice } from "@/constants/subscriptionPlans";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function SubscriptionSection() {
  const { tier, loading, subscribed, subscriptionStatus, subscriptionEnd, productId, refreshSubscription, isRetrying, retryAttempts, retryWithIntelligentBackoff } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  // Handle success/cancel messages from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Checking your subscription status... This may take a few minutes.",
      });
      // Auto-start intelligent retry for post-payment verification
      retryWithIntelligentBackoff(true);
      // Clear the URL parameter
      setSearchParams(prev => {
        prev.delete('success');
        return prev;
      });
    }
    
    if (canceled === 'true') {
      toast({
        title: "Canceled",
        description: "The checkout process was canceled. No charges were made.",
        variant: "destructive",
      });
      // Clear the URL parameter
      setSearchParams(prev => {
        prev.delete('canceled');
        return prev;
      });
    }
  }, [searchParams, setSearchParams, toast, retryWithIntelligentBackoff]);

  const currentPlan = getPlanByProductId(productId || '') || SUBSCRIPTION_PLANS.find(p => p.id === tier);
  const planName = getPlanDisplayName(tier);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") {
      navigate('/build');
      return;
    }

    const priceId = getPriceId(planId, isAnnual);
    if (!priceId) {
      toast({
        title: "Error",
        description: "Price not found for this plan",
        variant: "destructive",
      });
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
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSubscription();
      toast({
        title: "Success",
        description: "Subscription status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to refresh subscription status.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Subscription</h3>
          <p className="text-sm text-muted-foreground">Loading subscription information...</p>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Subscription</h3>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and view plan details
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing || isRetrying}
          className="gap-2"
        >
          {refreshing || isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshing ? 'Refreshing...' : isRetrying ? 'Checking...' : 'Refresh Status'}
        </Button>
      </div>

      {/* Intelligent Retry Status */}
      {isRetrying && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Verifying your subscription...
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Attempt {retryAttempts}/8
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We're checking with Stripe to confirm your payment. This usually takes 1-2 minutes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Subscription Management */}
      {subscribed && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Manage Subscription</div>
                <div className="text-sm text-muted-foreground">
                  Change plan, update billing, or cancel subscription
                </div>
                {subscriptionEnd && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Renews on {formatDate(subscriptionEnd)}
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">Available Plans</h4>
        
        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={!isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>Monthly</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}>
            Annual {isAnnual && <span className="text-xs text-muted-foreground">(billed annually)</span>} <Badge variant="secondary" className="ml-2">-20%</Badge>
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const annualPrice = getAnnualPrice(plan.price);
            const displayPrice = isAnnual && plan.price > 0 ? Math.floor(annualPrice / 12) : plan.price;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.id === tier ? 'ring-2 ring-primary' : ''} ${plan.recommended ? 'border-primary scale-105' : ''}`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.id === tier && (
                      <Badge variant="outline">Current</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="py-4">
                    <div className="text-3xl font-bold">
                      ${displayPrice}
                      <span className="text-base font-normal text-muted-foreground">/mo</span>
                    </div>
                    {isAnnual && plan.price > 0 && (
                      <div className="text-sm text-muted-foreground">
                        ${annualPrice}/year (save 20%)
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.recommended ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.id !== "free" && plan.id === tier || (isLoading)}
                  >
                    {isLoading && plan.id !== "free" ? "Loading..." : 
                     plan.id === tier ? "Current Plan" :
                     plan.id === "free" ? "Get Started Free" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Refund Policy Link */}
        <div className="text-center mt-6">
          <Button 
            variant="link" 
            onClick={() => window.location.href = '/refund-policy'}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Cancellation and Refund Policy
          </Button>
        </div>
      </div>
    </div>
  );
}