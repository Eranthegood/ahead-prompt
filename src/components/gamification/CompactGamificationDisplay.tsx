import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XPProgressBar } from './XPProgressBar';
import { Trophy, ExternalLink } from 'lucide-react';
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
    <div className="space-y-3">
      {/* XP Progress Bar */}
      <XPProgressBar stats={stats} />
      
      {/* Link to full achievements page */}
      <Button 
        variant="ghost" 
        className="w-full justify-between text-left font-normal text-sm h-8"
        asChild
      >
        <Link to="/achievements">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span>Voir tous les succès</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {achievements.length}
            </span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </div>
        </Link>
      </Button>
    </div>
  );
};