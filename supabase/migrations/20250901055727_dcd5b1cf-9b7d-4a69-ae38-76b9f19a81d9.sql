-- Create user stats table for XP, levels, and streaks
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_prompts_created INTEGER NOT NULL DEFAULT 0,
  total_prompts_completed INTEGER NOT NULL DEFAULT 0,
  total_epics_created INTEGER NOT NULL DEFAULT 0,
  total_epics_completed INTEGER NOT NULL DEFAULT 0,
  total_ai_generations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type, achievement_name)
);

-- Create daily activity tracking table
CREATE TABLE public.daily_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prompts_created INTEGER NOT NULL DEFAULT 0,
  prompts_completed INTEGER NOT NULL DEFAULT 0,
  epics_created INTEGER NOT NULL DEFAULT 0,
  epics_completed INTEGER NOT NULL DEFAULT 0,
  ai_generations INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS on all tables
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_stats
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for daily_activity
CREATE POLICY "Users can view their own daily activity" 
ON public.daily_activity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily activity" 
ON public.daily_activity 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily activity" 
ON public.daily_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating user_stats updated_at
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating daily_activity updated_at
CREATE TRIGGER update_daily_activity_updated_at
BEFORE UPDATE ON public.daily_activity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate level based on XP (every 100 XP = new level)
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, (xp / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user stats when they don't exist
CREATE OR REPLACE FUNCTION public.ensure_user_stats(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;