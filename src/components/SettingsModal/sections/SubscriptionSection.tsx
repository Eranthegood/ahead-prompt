import { useSubscription, PLAN_LIMITS, getPlanDisplayName } from "@/hooks/useSubscription";
import { PlanBadge } from "@/components/ui/plan-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SubscriptionSection() {
  const { tier, loading } = useSubscription();
  const navigate = useNavigate();

  const currentPlan = PLAN_LIMITS[tier];
  const planName = getPlanDisplayName(tier);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Subscription</h3>
          <p className="text-sm text-muted-foreground">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and view plan details
        </p>
      </div>

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
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Plan Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium">Products</div>
                <div className="text-muted-foreground">
                  {currentPlan.products === -1 ? 'Unlimited' : currentPlan.products}
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Epics per Product</div>
                <div className="text-muted-foreground">
                  {currentPlan.epicsPerProduct === -1 ? 'Unlimited' : currentPlan.epicsPerProduct}
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Prompt Library</div>
                <div className="text-muted-foreground">
                  {currentPlan.promptLibraryItems === -1 ? 'Unlimited' : `${currentPlan.promptLibraryItems} items`}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Included Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {tier === 'free' && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Ready to upgrade?</div>
                  <div className="text-sm text-muted-foreground">
                    Unlock more features and remove limitations
                  </div>
                </div>
                <Button onClick={handleUpgrade} className="gap-2">
                  View Plans
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {tier !== 'free' && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Manage Subscription</div>
                  <div className="text-sm text-muted-foreground">
                    Change plan, update billing, or cancel subscription
                  </div>
                </div>
                <Button variant="outline" onClick={handleUpgrade} className="gap-2">
                  Manage
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}