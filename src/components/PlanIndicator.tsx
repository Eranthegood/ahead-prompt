import { PlanBadge } from "@/components/ui/plan-badge";
import { useSubscription } from "@/hooks/useSubscription";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PlanIndicator({ size = 'md', showIcon = true, className }: PlanIndicatorProps) {
  const { tier, loading } = useSubscription();

  if (loading) {
    return <Skeleton className={`h-6 w-16 ${className}`} />;
  }

  return (
    <div className={className}>
      <PlanBadge tier={tier} size={size} showIcon={showIcon} />
    </div>
  );
}