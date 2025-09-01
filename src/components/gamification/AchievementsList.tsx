import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAchievement, ACHIEVEMENTS } from '@/types/gamification';

interface AchievementsListProps {
  achievements: UserAchievement[];
  className?: string;
}

export const AchievementsList: React.FC<AchievementsListProps> = ({ 
  achievements, 
  className 
}) => {
  const getAchievementDetails = (achievement: UserAchievement) => {
    return ACHIEVEMENTS.find(
      a => a.type === achievement.achievement_type && a.name === achievement.achievement_name
    );
  };

  const unlockedAchievements = achievements.map(a => getAchievementDetails(a)).filter(Boolean);
  const lockedAchievements = ACHIEVEMENTS.filter(
    a => !achievements.some(ua => ua.achievement_type === a.type && ua.achievement_name === a.name)
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 Succès
          <Badge variant="secondary">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</Badge>
        </CardTitle>
        <CardDescription>
          Vos accomplissements sur la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {/* Unlocked Achievements */}
            {unlockedAchievements.map((achievement, index) => (
              <div 
                key={`unlocked-${index}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10"
              >
                <span className="text-2xl">{achievement?.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement?.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement?.description}</div>
                </div>
                <Badge className="bg-primary/20 text-primary">+{achievement?.xp_reward} XP</Badge>
              </div>
            ))}

            {/* Locked Achievements */}
            {lockedAchievements.map((achievement, index) => (
              <div 
                key={`locked-${index}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 opacity-60"
              >
                <span className="text-2xl grayscale">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm text-muted-foreground">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  {achievement.xp_reward} XP
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};