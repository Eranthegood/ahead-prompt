import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Star } from 'lucide-react';
import { UserStats, LEVEL_TITLES } from '@/types/gamification';

interface XPProgressBarProps {
  stats: UserStats;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ stats }) => {
  const currentLevelXP = (stats.current_level - 1) * 100;
  const nextLevelXP = stats.current_level * 100;
  const progressXP = stats.total_xp - currentLevelXP;
  const progressPercentage = (progressXP / 100) * 100;

  const levelTitle = LEVEL_TITLES[stats.current_level as keyof typeof LEVEL_TITLES] || 'Master';

  return (
    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
          <Star className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <Badge variant="secondary" className="text-xs">
            Niveau {stats.current_level}
          </Badge>
          <span className="text-xs text-muted-foreground">{levelTitle}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {progressXP}/{100} XP
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            {stats.total_xp}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
};