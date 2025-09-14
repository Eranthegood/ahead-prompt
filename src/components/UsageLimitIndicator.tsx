import { useSubscription, PLAN_LIMITS, canCreateProduct, canCreateEpic, canCreatePromptLibraryItem } from "@/hooks/useSubscription";
import { useProducts } from "@/hooks/useProducts";
import { usePromptLibrary } from "@/hooks/usePromptLibrary";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Package, FolderOpen, BookOpen } from "lucide-react";

interface UsageLimitIndicatorProps {
  type: 'products' | 'epics' | 'promptLibrary';
  currentCount: number;
  className?: string;
}

export function UsageLimitIndicator({ type, currentCount, className }: UsageLimitIndicatorProps) {
  const { tier } = useSubscription();
  const navigate = useNavigate();
  
  const limits = PLAN_LIMITS[tier];
  const maxCount = type === 'products' ? limits.products : 
                   type === 'epics' ? limits.epicsPerProduct : 
                   limits.promptLibraryItems;

  const canCreate = type === 'products' ? canCreateProduct(tier, currentCount) :
                    type === 'epics' ? canCreateEpic(tier, currentCount) :
                    canCreatePromptLibraryItem(tier, currentCount);

  const icons = {
    products: Package,
    epics: FolderOpen,
    promptLibrary: BookOpen
  };

  const labels = {
    products: 'Products',
    epics: 'Epics',
    promptLibrary: 'Prompt Library'
  };

  const Icon = icons[type];
  const label = labels[type];

  // Don't show for unlimited plans
  if (maxCount === -1) {
    return null;
  }

  const percentage = (currentCount / maxCount) * 100;
  const isAtLimit = currentCount >= maxCount;

  return (
    <Card className={`${className} ${isAtLimit ? 'border-warning' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{label}</CardTitle>
          </div>
          <Badge variant={isAtLimit ? "destructive" : "secondary"} className="text-xs">
            {currentCount}/{maxCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percentage} className="h-2" />
        
        {isAtLimit && (
          <div className="space-y-2">
            <CardDescription className="text-xs text-warning">
              You've reached your {label.toLowerCase()} limit for the {tier} plan
            </CardDescription>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate('/pricing')}
              className="w-full gap-2"
            >
              Upgrade Plan
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {!isAtLimit && percentage > 80 && (
          <CardDescription className="text-xs">
            You're close to your limit. Consider upgrading soon.
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}

// Combined usage overview component
export function UsageOverview({ className }: { className?: string }) {
  const { products } = useProducts();
  const { userItems: libraryPrompts } = usePromptLibrary();
  
  // For epics, we'd need to count epics per product, but for simplicity 
  // we'll show it in the product context where it's more relevant
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      <UsageLimitIndicator 
        type="products" 
        currentCount={products?.length || 0} 
      />
      <UsageLimitIndicator 
        type="promptLibrary" 
        currentCount={libraryPrompts?.length || 0} 
      />
    </div>
  );
}