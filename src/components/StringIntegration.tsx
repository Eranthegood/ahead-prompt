import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Check, ExternalLink, Webhook, FileText, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SEOArticle {
  id: string;
  title: string;
  content: string;
  meta_description?: string;
  keywords?: string[];
  url?: string;
  published_at?: string;
  status: string;
  seo_score?: number;
  source: string;
  created_at: string;
}

interface WebhookLog {
  id: string;
  source: string;
  event_type: string;
  processed_count: number;
  status: string;
  error_message?: string;
  created_at: string;
}

export function StringIntegration() {
  const [articles, setArticles] = useState<SEOArticle[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [testWebhookUrl, setTestWebhookUrl] = useState('');
  const [testPayload, setTestPayload] = useState(JSON.stringify({
    article: {
      id: "test-123",
      title: "Article SEO de test",
      content: "Contenu de l'article de test pour vérifier l'intégration...",
      meta_description: "Description meta de test",
      keywords: ["seo", "test", "string"],
      url: "https://example.com/article-test",
      published_at: new Date().toISOString(),
      status: "published",
      seo_score: 85
    }
  }, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const { toast } = useToast();

  const webhookUrl = `https://fkpbdzluddeqsfvacozw.supabase.co/functions/v1/string-webhook`;

  useEffect(() => {
    fetchArticles();
    fetchWebhookLogs();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('source', 'string.com')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWebhookLogs(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    }
  };

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhookUrl(true);
      setTimeout(() => setCopiedWebhookUrl(false), 2000);
      toast({
        title: "URL copiée",
        description: "L'URL du webhook a été copiée dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'URL",
        variant: "destructive"
      });
    }
  };

  const testWebhook = async () => {
    if (!testWebhookUrl.trim()) {
      toast({
        title: "URL manquante",
        description: "Veuillez entrer l'URL du webhook à tester",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let payload;
      try {
        payload = JSON.parse(testPayload);
      } catch {
        throw new Error('JSON payload invalide');
      }

      const response = await fetch(testWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Test réussi",
          description: "Le webhook a été testé avec succès"
        });
        // Refresh data after test
        setTimeout(() => {
          fetchArticles();
          fetchWebhookLogs();
        }, 1000);
      } else {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      toast({
        title: "Erreur de test",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Succès</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Erreur</Badge>;
      case 'published':
        return <Badge variant="success">Publié</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Webhook className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Intégration String.com</h1>
          <p className="text-muted-foreground">Automatisez la récupération d'articles SEO via webhook</p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="articles">Articles SEO</TabsTrigger>
          <TabsTrigger value="logs">Logs Webhook</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Configuration du Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">URL du Webhook à configurer dans String.com</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyWebhookUrl}
                    className="flex-shrink-0"
                  >
                    {copiedWebhookUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Copiez cette URL dans la configuration webhook de votre compte String.com
                </p>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Instructions de configuration
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Connectez-vous à votre compte String.com</li>
                  <li>Allez dans les paramètres d'automatisation/webhooks</li>
                  <li>Créez un nouveau webhook avec l'URL ci-dessus</li>
                  <li>Sélectionnez les événements "Article créé/modifié"</li>
                  <li>Sauvegardez la configuration</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Articles SEO récupérés ({articles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun article récupéré pour le moment</p>
                  <p className="text-sm">Les articles apparaîtront ici une fois le webhook configuré</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Score SEO</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{article.title}</div>
                            {article.meta_description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {article.meta_description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(article.status)}</TableCell>
                        <TableCell>
                          {article.seo_score && (
                            <Badge variant={article.seo_score >= 80 ? 'success' : article.seo_score >= 60 ? 'secondary' : 'destructive'}>
                              {article.seo_score}/100
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(article.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {article.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(article.url, '_blank')}
                                className="h-8 w-8 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs des Webhooks ({webhookLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {webhookLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun log pour le moment</p>
                  <p className="text-sm">L'activité des webhooks sera affichée ici</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type d'événement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Articles traités</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.event_type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.processed_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.error_message && (
                            <div className="text-sm text-destructive truncate max-w-xs">
                              {log.error_message}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tester le Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-url">URL du webhook à tester</Label>
                <Input
                  id="test-url"
                  value={testWebhookUrl}
                  onChange={(e) => setTestWebhookUrl(e.target.value)}
                  placeholder={webhookUrl}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Laissez vide pour utiliser l'URL par défaut
                </p>
              </div>

              <div>
                <Label htmlFor="test-payload">Payload JSON de test</Label>
                <Textarea
                  id="test-payload"
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={testWebhook}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Test en cours...' : 'Tester le Webhook'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}