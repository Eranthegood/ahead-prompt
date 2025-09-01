import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BinaryTask, CreateBinaryTaskData, UpdateBinaryTaskData } from '@/types/binaryTasks';

export const useBinaryTasks = () => {
  const [tasks, setTasks] = useState<BinaryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('binary_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tâches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateBinaryTaskData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('binary_tasks')
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      toast({
        title: 'Succès',
        description: 'Tâche créée avec succès',
      });

      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la tâche',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: UpdateBinaryTaskData) => {
    try {
      const { data, error } = await supabase
        .from('binary_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? data : task
      ));

      toast({
        title: 'Succès',
        description: 'Tâche mise à jour',
      });

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la tâche',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    return updateTask(taskId, { is_completed: !task.is_completed });
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('binary_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: 'Succès',
        description: 'Tâche supprimée',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la tâche',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('binary-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'binary_tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const todoTasks = tasks.filter(task => !task.is_completed);
  const completedTasks = tasks.filter(task => task.is_completed);

  return {
    tasks,
    todoTasks,
    completedTasks,
    loading,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    refetch: fetchTasks,
  };
};