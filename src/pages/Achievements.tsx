import { ArrowLeft, Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/hooks/useGamification';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { AchievementsList } from '@/components/gamification/AchievementsList';
import { LEVEL_TITLES } from '@/types/gamification';

const Achievements = () => {
  const { stats, achievements, loading } = useGamification();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Impossible de charger les statistiques</p>
      </div>
    );
  }

  const levelTitle = LEVEL_TITLES[stats.current_level as keyof typeof LEVEL_TITLES] || 'Master';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Succès & Progression</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Niveau Actuel</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.current_level}</div>
              <p className="text-xs text-muted-foreground">{levelTitle}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">XP Total</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.total_xp}</div>
              <p className="text-xs text-muted-foreground">Points d'expérience</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Série Actuelle</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.current_streak}</div>
              <p className="text-xs text-muted-foreground">
                Meilleure: {stats.best_streak} jours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Succès Débloqués</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{achievements.length}</div>
              <p className="text-xs text-muted-foreground">Récompenses obtenues</p>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Progression XP
            </CardTitle>
            <CardDescription>
              Votre progression vers le niveau suivant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <XPProgressBar stats={stats} animate />
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité</CardTitle>
              <CardDescription>Vos statistiques d'activité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Prompts créés</span>
                <Badge variant="secondary">{stats.total_prompts_created}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Prompts complétés</span>
                <Badge variant="secondary">{stats.total_prompts_completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Épiques créées</span>
                <Badge variant="secondary">{stats.total_epics_created}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Épiques complétées</span>
                <Badge variant="secondary">{stats.total_epics_completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Générations IA</span>
                <Badge variant="secondary">{stats.total_ai_generations}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Succès
              </CardTitle>
              <CardDescription>Vos récompenses et accomplissements</CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementsList achievements={achievements} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Achievements;