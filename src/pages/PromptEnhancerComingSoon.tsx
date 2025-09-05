import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Zap, Target } from 'lucide-react';

export default function PromptEnhancerComingSoon() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Prompt Enhancer</h1>
          <Badge variant="secondary" className="text-xs">Soon</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Nous travaillons sur quelque chose d'incroyable pour améliorer vos prompts AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Amélioration Intelligente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Transformez vos idées brutes en prompts optimisés grâce à notre IA avancée qui comprend le contexte et les meilleures pratiques.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Templates Spécialisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Accédez à une bibliothèque de templates pré-conçus pour différents cas d'usage : code, design, marketing, et plus encore.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Optimisation Continue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Analysez les performances de vos prompts et recevez des suggestions d'amélioration basées sur les résultats obtenus.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Collaboration Équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Partagez vos meilleurs prompts avec votre équipe et construisez ensemble une bibliothèque de prompts efficaces.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Bientôt Disponible</h3>
            <p className="text-muted-foreground mb-4">
              Prompt Enhancer est actuellement en développement intensif. Cette fonctionnalité révolutionnaire sera bientôt disponible pour tous nos utilisateurs.
            </p>
            <p className="text-sm text-muted-foreground">
              Restez connecté pour être parmi les premiers à l'essayer !
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}