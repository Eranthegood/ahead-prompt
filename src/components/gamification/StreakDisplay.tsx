import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';
import { UserStats } from '@/types/gamification';

interface StreakDisplayProps {
  stats: UserStats;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ stats }) => {
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={stats.current_streak > 0 ? "default" : "outline"} 
        className="flex items-center gap-1"
      >
        <Flame className={`w-3 h-3 ${stats.current_streak > 0 ? 'text-orange-400' : ''}`} />
        {stats.current_streak} jours
      </Badge>
      
      {stats.best_streak > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Trophy className="w-3 h-3 text-yellow-500" />
          Record: {stats.best_streak}
        </Badge>
      )}
    </div>
  );
};