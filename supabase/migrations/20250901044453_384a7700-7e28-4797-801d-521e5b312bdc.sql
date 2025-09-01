-- Création de la table pour les tâches binaires
CREATE TABLE public.binary_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.binary_tasks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les tâches binaires
CREATE POLICY "Users can view their own tasks" 
ON public.binary_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.binary_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.binary_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.binary_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION public.update_binary_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour automatic timestamp updates
CREATE TRIGGER update_binary_tasks_updated_at
  BEFORE UPDATE ON public.binary_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_binary_tasks_updated_at();

-- Index pour optimiser les requêtes
CREATE INDEX idx_binary_tasks_user_id ON public.binary_tasks(user_id);
CREATE INDEX idx_binary_tasks_completed ON public.binary_tasks(user_id, is_completed);