import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserStats, UserAchievement } from '@/types/gamification';

interface CompactGamificationDisplayProps {
  stats: UserStats;
  achievements: UserAchievement[];
}

export const CompactGamificationDisplay: React.FC<CompactGamificationDisplayProps> = ({ 
  stats, 
  achievements 
}) => {
  return (
    <div className="space-y-2">
      {/* Simple level and XP display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Niveau {stats.current_level}</span>
        <span className="text-xs text-muted-foreground">{stats.total_xp} XP</span>
      </div>
      
      {/* Minimal progress bar */}
      <div className="space-y-1">
        <Progress value={(stats.total_xp % 100)} className="h-1" />
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full h-6 text-xs text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/achievements">
            {achievements.length} succès →
          </Link>
        </Button>
      </div>
    </div>
  );
};