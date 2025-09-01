import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/hooks/useGamification';

interface PremiumFeatureCardProps {
  featureName: string;
  requiredLevel: number;
  isUnlocked: boolean;
  xpNeeded: number;
  currentLevel: number;
  icon?: React.ReactNode;
  description?: string;
}

export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  featureName,
  requiredLevel,
  isUnlocked,
  xpNeeded,
  currentLevel,
  icon,
  description,
}) => {
  const navigate = useNavigate();
  const { stats } = useGamification();

  if (isUnlocked) return null;

  const currentXP = stats?.total_xp || 0;
  const requiredXP = (requiredLevel - 1) * 100;
  const progress = Math.min((currentXP / requiredXP) * 100, 100);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon || <Crown className="h-5 w-5 text-primary" />}
            <CardTitle className="text-lg">{featureName}</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            <Star className="mr-1 h-3 w-3" />
            Premium
          </Badge>
        </div>
        <CardDescription>
          {description || `Cette fonctionnalité est débloquée au niveau ${requiredLevel}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progression vers le niveau {requiredLevel}</span>
            <span className="font-medium">
              Niveau {currentLevel}/{requiredLevel}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{currentXP} XP</span>
            <span>{requiredXP} XP</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
          <Zap className="h-4 w-4 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium text-accent-foreground">
              {xpNeeded > 0 ? `${xpNeeded} XP restants !` : 'Presque là !'}
            </p>
            <p className="text-xs text-muted-foreground">
              Créez des prompts et complétez des épics pour gagner de l'XP
            </p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => navigate('/profile')}
        >
          <Crown className="mr-2 h-4 w-4" />
          Voir mes statistiques
        </Button>
      </CardContent>
    </Card>
  );
};