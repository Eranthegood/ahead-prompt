import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Star } from 'lucide-react';
import { UserStats, LEVEL_TITLES } from '@/types/gamification';
import { useEffect, useState } from 'react';

interface XPProgressBarProps {
  stats: UserStats;
  animate?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ stats, animate = false }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const currentLevelXP = (stats.current_level - 1) * 100;
  const nextLevelXP = stats.current_level * 100;
  const progressXP = stats.total_xp - currentLevelXP;
  const progressPercentage = (progressXP / 100) * 100;

  const levelTitle = LEVEL_TITLES[stats.current_level as keyof typeof LEVEL_TITLES] || 'Master';

  useEffect(() => {
    if (animate) {
      setAnimatedProgress(0);
      const timer = setTimeout(() => {
        setAnimatedProgress(progressPercentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progressPercentage);
    }
  }, [progressPercentage, animate]);

  return (
    <div className="bg-card rounded p-3 border space-y-2">
      {/* Level and Title */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Niveau {stats.current_level} - {levelTitle}
        </div>
        <div className="text-xs text-muted-foreground">
          {stats.total_xp} XP
        </div>
      </div>

      {/* Progress Bar and XP */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progressXP}/{100} XP</span>
          <span>Prochain niveau</span>
        </div>
        <Progress 
          value={animatedProgress} 
          className="h-2" 
          aria-label={`Progression XP: ${progressXP} sur 100`}
        />
      </div>
    </div>
  );
};