import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBinaryTasks } from '@/hooks/useBinaryTasks';
import { Plus, Check, X, Edit, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const BinaryTaskManager = () => {
  const { todoTasks, completedTasks, loading, createTask, updateTask, toggleTask, deleteTask } = useBinaryTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editTask, setEditTask] = useState({ title: '', description: '' });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
      });
      
      setNewTask({ title: '', description: '' });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask.title.trim()) return;

    try {
      await updateTask(taskId, {
        title: editTask.title.trim(),
        description: editTask.description.trim() || undefined,
      });
      
      setEditingTask(null);
      setEditTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEdit = (task: any) => {
    setEditingTask(task.id);
    setEditTask({
      title: task.title,
      description: task.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTask({ title: '', description: '' });
  };

  const TaskCard = ({ task, isCompleted }: { task: any; isCompleted: boolean }) => (
    <Card className={`transition-all duration-200 ${isCompleted ? 'opacity-70 bg-muted/50' : 'bg-card hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleTask(task.id)}
            className={`p-1 h-8 w-8 flex-shrink-0 ${
              isCompleted 
                ? 'text-status-done hover:text-status-done-foreground' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </Button>
          
          <div className="flex-1 min-w-0">
            {editingTask === task.id ? (
              <form onSubmit={(e) => handleEditTask(task.id, e)} className="space-y-3">
                <Input
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  placeholder="Titre de la tâche"
                  className="text-sm"
                />
                <Textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  placeholder="Description (optionnelle)"
                  className="text-sm min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="default">
                    <Check className="h-3 w-3 mr-1" />
                    Sauver
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="h-3 w-3 mr-1" />
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h3 className={`font-medium text-sm leading-tight ${
                  isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-xs mt-1 leading-relaxed ${
                    isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                  }`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.created_at), 'dd MMM à HH:mm', { locale: fr })}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(task)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestionnaire de Tâches</h1>
          <p className="text-muted-foreground">
            {todoTasks.length} à faire • {completedTasks.length} terminées
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Qu'avez-vous à faire ?"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Détails supplémentaires..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Créer la tâche
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{todoTasks.length}</p>
                <p className="text-sm text-muted-foreground">À faire</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-status-done" />
              <div>
                <p className="text-2xl font-bold text-foreground">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {todoTasks.length + completedTasks.length > 0 
                  ? `${Math.round((completedTasks.length / (todoTasks.length + completedTasks.length)) * 100)}%`
                  : '0%'
                }
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">Progression</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne À faire */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Circle className="h-5 w-5 text-primary" />
                À faire ({todoTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todoTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune tâche à faire</p>
                  <p className="text-xs">Créez une nouvelle tâche pour commencer</p>
                </div>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} isCompleted={false} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne Terminé */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-status-done" />
                Terminées ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune tâche terminée</p>
                  <p className="text-xs">Complétez vos tâches pour les voir ici</p>
                </div>
              ) : (
                completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} isCompleted={true} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};