import { UsageOverview } from '@/components/UsageLimitIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { Shield, TrendingUp } from 'lucide-react';

export function UsageOverviewDashboard() {
  const { tier } = useSubscription();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Usage Overview</CardTitle>
            <CardDescription>
              Track your usage against your {tier} plan limits
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UsageOverview />
      </CardContent>
    </Card>
  );
}