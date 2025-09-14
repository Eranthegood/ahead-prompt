import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle, Clock, AlertCircle, Users, Settings, Home, List, Plus } from 'lucide-react';

export const GetItDoneDesignSystem = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground">Get It Done Design System</h1>
          <p className="text-muted-foreground mt-1">Inspiré de Todoist - Minimalisme épuré et fonctionnel</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Palette de couleurs */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Palette de couleurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Couleurs principales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Couleurs principales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground">213 94% 68%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-secondary"></div>
                  <div>
                    <p className="text-sm font-medium">Secondary</p>
                    <p className="text-xs text-muted-foreground">220 14% 96%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-muted"></div>
                  <div>
                    <p className="text-sm font-medium">Muted</p>
                    <p className="text-xs text-muted-foreground">220 14% 96%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* États des tâches */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">États des tâches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: 'hsl(240 5% 50%)'}}></div>
                  <div>
                    <p className="text-sm font-medium">Todo</p>
                    <p className="text-xs text-muted-foreground">240 5% 50%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: 'hsl(217 91% 60%)'}}></div>
                  <div>
                    <p className="text-sm font-medium">In Progress</p>
                    <p className="text-xs text-muted-foreground">217 91% 60%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: 'hsl(142 71% 45%)'}}></div>
                  <div>
                    <p className="text-sm font-medium">Done</p>
                    <p className="text-xs text-muted-foreground">142 71% 45%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priorités */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Priorités</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: 'hsl(0 65% 55%)'}}></div>
                  <div>
                    <p className="text-sm font-medium">Critique</p>
                    <p className="text-xs text-muted-foreground">0 65% 55%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: 'hsl(25 95% 53%)'}}></div>
                  <div>
                    <p className="text-sm font-medium">Élevée</p>
                    <p className="text-xs text-muted-foreground">25 95% 53%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: 'hsl(217 91% 60%)'}}></div>
                  <div>
                    <p className="text-sm font-medium">Moyenne</p>
                    <p className="text-xs text-muted-foreground">217 91% 60%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: 'hsl(240 5% 64%)'}}></div>
                  <div>
                    <p className="text-sm font-medium">Basse</p>
                    <p className="text-xs text-muted-foreground">240 5% 64%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Composants UI */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Composants UI</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Boutons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Boutons</CardTitle>
                <CardDescription>Touch targets 44px minimum</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="lg">Primary</Button>
                  <Button variant="secondary" size="lg">Secondary</Button>
                  <Button variant="outline" size="lg">Outline</Button>
                  <Button variant="ghost" size="lg">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button variant="destructive" size="sm">Destructive</Button>
                </div>
              </CardContent>
            </Card>

            {/* Inputs et Forms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Inputs & Forms</CardTitle>
                <CardDescription>16px+ pour éviter le zoom mobile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Rechercher une tâche..." className="text-base" />
                <Input placeholder="Ajouter une nouvelle tâche..." className="text-base" />
                <div className="flex gap-2">
                  <Input placeholder="Date" className="text-base" />
                  <Button size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Badges et États */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Badges & États</h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Todo
                </Badge>
                <Badge className="flex items-center gap-1" style={{backgroundColor: 'hsl(217 91% 60%)', color: 'white'}}>
                  <Settings className="h-3 w-3" />
                  En cours
                </Badge>
                <Badge className="flex items-center gap-1" style={{backgroundColor: 'hsl(142 71% 45%)', color: 'white'}}>
                  <CheckCircle className="h-3 w-3" />
                  Terminé
                </Badge>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Bloqué
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progression générale</span>
                  <span className="text-sm font-medium">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Sidebar Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Navigation Sidebar</h2>
          
          <Card>
            <CardContent className="p-0">
              <div className="flex">
                {/* Sidebar simulée */}
                <div className="w-64 bg-sidebar-background border-r border-sidebar-border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-primary bg-sidebar-accent rounded-md">
                      <Home className="h-4 w-4" />
                      Accueil
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors">
                      <List className="h-4 w-4" />
                      Mes tâches
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors">
                      <Users className="h-4 w-4" />
                      Équipe
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors">
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="px-3 py-1 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                      Projets
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'hsl(0 65% 55%)'}}></div>
                      Projet critique
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'hsl(217 91% 60%)'}}></div>
                      Développement
                    </div>
                  </div>
                </div>
                
                {/* Contenu principal */}
                <div className="flex-1 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Mes tâches</h3>
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Nouvelle tâche
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { title: "Réviser le design system", priority: "critique", status: "todo" },
                        { title: "Implémenter les nouveaux composants", priority: "élevée", status: "progress" },
                        { title: "Tests d'accessibilité WCAG", priority: "moyenne", status: "done" },
                        { title: "Documentation utilisateur", priority: "basse", status: "todo" }
                      ].map((task, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className="text-xs" 
                                style={{
                                  borderColor: task.priority === 'critique' ? 'hsl(0 65% 55%)' : 
                                             task.priority === 'élevée' ? 'hsl(25 95% 53%)' :
                                             task.priority === 'moyenne' ? 'hsl(217 91% 60%)' : 'hsl(240 5% 64%)',
                                  color: task.priority === 'critique' ? 'hsl(0 65% 55%)' : 
                                         task.priority === 'élevée' ? 'hsl(25 95% 53%)' :
                                         task.priority === 'moyenne' ? 'hsl(217 91% 60%)' : 'hsl(240 5% 64%)'
                                }}
                              >
                                {task.priority}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{
                                  backgroundColor: task.status === 'done' ? 'hsl(142 71% 45%)' :
                                                 task.status === 'progress' ? 'hsl(217 91% 60%)' : 'transparent',
                                  color: task.status === 'done' || task.status === 'progress' ? 'white' : 'hsl(240 5% 50%)',
                                  borderColor: task.status === 'done' ? 'hsl(142 71% 45%)' :
                                             task.status === 'progress' ? 'hsl(217 91% 60%)' : 'hsl(240 5% 50%)'
                                }}
                              >
                                {task.status === 'done' ? 'Terminé' : task.status === 'progress' ? 'En cours' : 'À faire'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Philosophie Design */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Philosophie Design</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Minimalisme épuré</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Contraste élevé mais doux (gris 25% vs blanc)</p>
                <p>• Couleurs saturées uniquement pour actions/statuts</p>
                <p>• Espacement généreux et hiérarchie claire</p>
                <p>• Gris neutres dominants avec accents colorés ciblés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Accessibilité</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Contrastes WCAG AA+ conformes</p>
                <p>• Touch targets 44px minimum sur mobile</p>
                <p>• Focus indicators visibles</p>
                <p>• Couleurs ne portant pas seules l'information</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};