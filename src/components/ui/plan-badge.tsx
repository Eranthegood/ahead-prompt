import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Gift } from "lucide-react";
interface PlanBadgeProps {
  tier: 'free' | 'basic' | 'pro';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}
const planConfig = {
  free: {
    label: 'Free',
    icon: Gift,
    variant: 'secondary' as const,
    className: 'bg-muted text-muted-foreground'
  },
  basic: {
    label: 'Basic',
    icon: Zap,
    variant: 'outline' as const,
    className: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400'
  },
  pro: {
    label: 'Pro',
    icon: Crown,
    variant: 'default' as const,
    className: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
  }
};
export function PlanBadge({
  tier,
  size = 'md',
  showIcon = true
}: PlanBadgeProps) {
  const config = planConfig[tier];
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  return;
}