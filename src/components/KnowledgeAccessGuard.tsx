import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/ui/plan-badge";
import { BookOpen, Crown, Zap } from "lucide-react";
import { useWorkspacePremiumAccess } from "@/hooks/useWorkspacePremiumAccess";
import { useNavigate } from "react-router-dom";

interface KnowledgeAccessGuardProps {
  children: React.ReactNode;
  showUpgradeCard?: boolean;
}

export function KnowledgeAccessGuard({ children, showUpgradeCard = true }: KnowledgeAccessGuardProps) {
  const { hasPremiumAccess, loading } = useWorkspacePremiumAccess();
  const navigate = useNavigate();

  if (loading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />;
  }

  // Allow access for users with premium access (personal subscription or Pro workspace)
  if (hasPremiumAccess) {
    return <>{children}</>;
  }

  // Show upgrade prompt for free users
  if (showUpgradeCard) {
    return (
      <Card>
        <CardHeader className="text-center pb-3">
          <div className="mx-auto mb-3">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Knowledge Base</CardTitle>
          <p className="text-sm text-muted-foreground">
            Store and organize important links, docs, and context for better AI prompts
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Available on:</span>
              <PlanBadge tier="basic" size="sm" />
              <PlanBadge tier="pro" size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Upgrade to access the knowledge base and enhance your AI workflow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Basic Plan Features:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Knowledge base access
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Advanced AI models
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Cursor integration
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Pro Plan Features:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Crown className="h-3 w-3" />
                  All Basic features
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-3 w-3" />
                  Prompt enhancer
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-3 w-3" />
                  Collaboration seats
                </li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full"
            size="sm"
          >
            Upgrade to Access Knowledge Base
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Just return null if not showing upgrade card
  return null;
}