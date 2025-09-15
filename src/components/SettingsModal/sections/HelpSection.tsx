import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, MessageCircle, Bug, Lightbulb, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const helpResources = [
  {
    title: 'Documentation',
    description: 'Guides complets et tutoriels',
    icon: BookOpen,
    link: '/docs',
    badge: 'Documentation',
  },
  {
    title: 'Annulation et remboursements',
    description: 'Politiques d\'annulation et de remboursement',
    icon: ExternalLink,
    link: '/refund-policy',
    badge: 'Politiques',
  },
  {
    title: 'Support par email',
    description: 'Contactez notre équipe support',
    icon: Mail,
    link: '/contact',
    badge: 'Contact',
  },
  {
    title: 'Signaler un bug',
    description: 'Aidez-nous à améliorer l\'application',
    icon: Bug,
    link: '/feedback',
    badge: 'Feedback',
  },
];

const quickLinks = [
  {
    title: 'Guide de démarrage',
    description: 'Apprenez les bases en 5 minutes',
    link: '/docs/getting-started',
  },
  {
    title: 'Raccourcis clavier',
    description: 'Maîtrisez tous les raccourcis',
    link: '#',
    action: () => {
      // This would switch to shortcuts section
    },
  },
  {
    title: 'Intégrations',
    description: 'Connectez vos outils favoris',
    link: '/integrations',
  },
  {
    title: 'API Reference',
    description: 'Documentation technique complète',
    link: '/docs/api',
  },
];

export function HelpSection() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Centre d'aide</CardTitle>
          <CardDescription>
            Trouvez de l'aide et des ressources pour utiliser au mieux l'application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {helpResources.map((resource) => {
              const Icon = resource.icon;
              
              return (
                <div key={resource.title} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{resource.title}</h3>
                        <Badge variant="outline">{resource.badge}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
onClick={() => {
                    if (resource.link.startsWith('/')) {
                      navigate(resource.link);
                    } else {
                      window.open(resource.link, '_blank');
                    }
                  }}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Accéder
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liens rapides</CardTitle>
          <CardDescription>
            Accès rapide aux ressources importantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {quickLinks.map((link) => (
              <div key={link.title} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
onClick={() => {
                    if (link.action) {
                      link.action();
                    } else if (link.link.startsWith('/')) {
                      navigate(link.link);
                    } else {
                      window.open(link.link, '_blank');
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations sur l'application</CardTitle>
          <CardDescription>
            Détails techniques et version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Version</span>
            <Badge variant="outline">v1.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Dernière mise à jour</span>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Statut du service</span>
            <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}