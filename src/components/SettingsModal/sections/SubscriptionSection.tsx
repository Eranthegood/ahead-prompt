import { useSubscription, getPlanDisplayName } from "@/hooks/useSubscription";
import { PlanBadge } from "@/components/ui/plan-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUpRight, CreditCard, Calendar, Loader2, RefreshCw, Star, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_PLANS, getPlanByProductId } from "@/constants/subscriptionPlans";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SubscriptionSection() {
  const { tier, loading, subscribed, subscriptionStatus, subscriptionEnd, productId, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle success/cancel messages from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: "Success!",
        description: "Your subscription has been activated. It may take a few minutes to update.",
      });
      // Auto-refresh subscription status
      setTimeout(() => {
        refreshSubscription();
      }, 2000);
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
  }, [searchParams, setSearchParams, toast, refreshSubscription]);

  const currentPlan = getPlanByProductId(productId || '') || SUBSCRIPTION_PLANS.find(p => p.id === tier);
  const planName = getPlanDisplayName(tier);

  const handleUpgrade = async (priceId: string) => {
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

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
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
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {planName} plan
              </CardDescription>
            </div>
            <PlanBadge tier={tier} size="lg" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subscription Status */}
          {subscribed && subscriptionEnd && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Your subscription renews on {formatDate(subscriptionEnd)}
              </AlertDescription>
            </Alert>
          )}

          {/* Plan Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Included Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t">
            {subscribed ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Manage Subscription</div>
                  <div className="text-sm text-muted-foreground">
                    Change plan, update billing, or cancel subscription
                  </div>
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
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Ready to upgrade?</div>
                  <div className="text-sm text-muted-foreground">
                    Unlock more features and remove limitations
                  </div>
                </div>
                <Button onClick={() => navigate('/pricing')} className="gap-2">
                  View Plans
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Available Plans</h4>
        <div className="grid gap-4 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.id === tier ? 'ring-2 ring-primary' : ''} ${plan.recommended ? 'border-primary' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Recommended
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.id === tier && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.id !== tier && plan.id !== 'free' && (
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleUpgrade(plan.priceId)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}