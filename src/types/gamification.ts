export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  best_streak: number;
  last_activity_date: string | null;
  total_prompts_created: number;
  total_prompts_completed: number;
  total_epics_created: number;
  total_epics_completed: number;
  total_ai_generations: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  unlocked_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  prompts_created: number;
  prompts_completed: number;
  epics_created: number;
  epics_completed: number;
  ai_generations: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  type: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  xp_reward: number;
}

export const LEVEL_TITLES = {
  1: 'Apprentice',
  2: 'Novice',
  3: 'Practitioner',
  4: 'Expert',
  5: 'Master',
  6: 'Architect',
  7: 'Legend'
} as const;

export const ACHIEVEMENTS: Achievement[] = [
  {
    type: 'prompt_creation',
    name: 'first_prompt',
    title: 'Premier Pas',
    description: 'Créer votre premier prompt',
    icon: '🎯',
    requirement: 1,
    xp_reward: 10
  },
  {
    type: 'prompt_creation',
    name: 'prompt_master',
    title: 'Maître des Prompts',
    description: 'Créer 10 prompts',
    icon: '🏆',
    requirement: 10,
    xp_reward: 50
  },
  {
    type: 'prompt_completion',
    name: 'finisher',
    title: 'Le Finisseur',
    description: 'Compléter 5 prompts',
    icon: '✅',
    requirement: 5,
    xp_reward: 25
  },
  {
    type: 'ai_generation',
    name: 'ai_enthusiast',
    title: 'Passionné d\'IA',
    description: 'Générer 20 prompts IA',
    icon: '🤖',
    requirement: 20,
    xp_reward: 100
  },
  {
    type: 'streak',
    name: 'streak_warrior',
    title: 'Guerrier de la Régularité',
    description: 'Atteindre une série de 7 jours',
    icon: '🔥',
    requirement: 7,
    xp_reward: 75
  }
];

export const XP_REWARDS = {
  PROMPT_CREATE: 5,
  PROMPT_COMPLETE: 10,
  EPIC_CREATE: 15,
  EPIC_COMPLETE: 25,
  AI_GENERATION: 8,
  DAILY_LOGIN: 2
} as const;