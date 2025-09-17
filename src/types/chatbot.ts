export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: ChatbotModel;
}

export interface ChatbotModel {
  id: string;
  name: string;
  provider: 'openai' | 'claude';
  modelId: string;
  tier: 'free' | 'basic' | 'pro';
  description: string;
  maxTokens: number;
  costPerToken?: number;
}

export interface ChatbotConfig {
  availableModels: ChatbotModel[];
  defaultModel: ChatbotModel;
  userTier: 'free' | 'basic' | 'pro';
  allowedModels: ChatbotModel[];
}

export interface ChatRequest {
  message: ChatMessage;
  sessionId?: string;
  model: ChatbotModel;
  context?: ChatMessage[];
}

export interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

// Chatbot model configurations based on subscription tiers
export const CHATBOT_MODELS: Record<string, ChatbotModel> = {
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'ChatGPT-4 Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    tier: 'free',
    description: 'Fast and efficient AI assistant for free users',
    maxTokens: 4096,
    costPerToken: 0.00015
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    modelId: 'claude-3-5-sonnet-20241022',
    tier: 'basic',
    description: 'Latest Claude model for basic subscribers',
    maxTokens: 8192,
    costPerToken: 0.003
  },
  'gpt-5': {
    id: 'gpt-5',
    name: 'ChatGPT-5',
    provider: 'openai',
    modelId: 'gpt-5-2025-08-07',
    tier: 'pro',
    description: 'Latest and most capable OpenAI model for pro users',
    maxTokens: 8192,
    costPerToken: 0.005
  }
};

export const getTierModels = (tier: 'free' | 'basic' | 'pro'): ChatbotModel[] => {
  const tierHierarchy = {
    free: ['free'],
    basic: ['free', 'basic'],
    pro: ['free', 'basic', 'pro']
  };
  
  const allowedTiers = tierHierarchy[tier];
  return Object.values(CHATBOT_MODELS).filter(model => 
    allowedTiers.includes(model.tier)
  );
};

export const getDefaultModel = (tier: 'free' | 'basic' | 'pro'): ChatbotModel => {
  switch (tier) {
    case 'free':
      return CHATBOT_MODELS['gpt-4o-mini'];
    case 'basic':
      return CHATBOT_MODELS['claude-3-5-sonnet'];
    case 'pro':
      return CHATBOT_MODELS['gpt-5'];
    default:
      return CHATBOT_MODELS['gpt-4o-mini'];
  }
};