import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { ChatbotService } from '@/services/chatbotService';
import { 
  ChatMessage, 
  ChatSession, 
  ChatbotModel, 
  ChatbotConfig,
  getTierModels,
  getDefaultModel,
  CHATBOT_MODELS 
} from '@/types/chatbot';

interface UseChatbotOptions {
  sessionId?: string;
  autoSave?: boolean;
}

export function useChatbot({ sessionId, autoSave = true }: UseChatbotOptions = {}) {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const { toast } = useToast();

  // State
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatbotModel | null>(null);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);

  // Initialize config based on user's subscription tier
  useEffect(() => {
    if (tier) {
      const availableModels = getTierModels(tier);
      const defaultModel = getDefaultModel(tier);
      
      setConfig({
        availableModels,
        defaultModel,
        userTier: tier,
        allowedModels: availableModels
      });
      
      if (!selectedModel) {
        setSelectedModel(defaultModel);
      }
    }
  }, [tier, selectedModel]);

  // Load user sessions
  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      const userSessions = await ChatbotService.getUserSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat sessions',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Load specific session if sessionId provided
  useEffect(() => {
    if (sessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        setMessages(session.messages);
        setSelectedModel(session.model);
      }
    }
  }, [sessionId, sessions]);

  // Create new session
  const createSession = useCallback(async (title?: string): Promise<ChatSession | null> => {
    if (!user || !selectedModel) {
      toast({
        title: 'Error',
        description: 'Please sign in and select a model to start chatting',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const sessionTitle = title || 'New Chat';
      const newSession = await ChatbotService.createSession(user.id, sessionTitle, selectedModel);
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, selectedModel, toast]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!user || !selectedModel || !content.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      model: selectedModel.id
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Create session if none exists
      let session = currentSession;
      if (!session) {
        session = await createSession(content.slice(0, 50));
        if (!session) return;
      }

      // Send to AI service
      const response = await ChatbotService.sendMessage({
        message: userMessage,
        sessionId: session.id,
        model: selectedModel,
        context: messages.slice(-10) // Last 10 messages for context
      });

      // Add assistant response to UI
      setMessages(prev => [...prev, response.message]);

      // Update current session with new messages
      if (autoSave) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, userMessage, response.message],
          updatedAt: new Date()
        } : null);
      }

      // Refresh sessions list to update timestamps
      await loadSessions();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive'
      });

      // Remove the user message from UI on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [user, selectedModel, currentSession, messages, autoSave, createSession, loadSessions, toast]);

  // Delete session
  const deleteSession = useCallback(async (sessionIdToDelete: string): Promise<void> => {
    try {
      await ChatbotService.deleteSession(sessionIdToDelete);
      setSessions(prev => prev.filter(s => s.id !== sessionIdToDelete));
      
      if (currentSession?.id === sessionIdToDelete) {
        setCurrentSession(null);
        setMessages([]);
      }

      toast({
        title: 'Success',
        description: 'Chat session deleted',
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat session',
        variant: 'destructive'
      });
    }
  }, [currentSession, toast]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string): Promise<void> => {
    try {
      await ChatbotService.updateSessionTitle(sessionId, title);
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title } : s
      ));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }

      toast({
        title: 'Success',
        description: 'Session title updated',
      });
    } catch (error) {
      console.error('Error updating session title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session title',
        variant: 'destructive'
      });
    }
  }, [currentSession, toast]);

  // Switch to different session
  const switchToSession = useCallback((session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setSelectedModel(session.model);
  }, []);

  // Clear current session messages (but keep session)
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Change model (only affects new messages)
  const changeModel = useCallback((model: ChatbotModel) => {
    if (config?.allowedModels.some(m => m.id === model.id)) {
      setSelectedModel(model);
    } else {
      toast({
        title: 'Access Denied',
        description: `${model.name} requires ${model.tier} subscription or higher`,
        variant: 'destructive'
      });
    }
  }, [config, toast]);

  return {
    // State
    currentSession,
    sessions,
    messages,
    isLoading,
    isTyping,
    selectedModel,
    config,

    // Actions
    createSession,
    sendMessage,
    deleteSession,
    updateSessionTitle,
    switchToSession,
    clearMessages,
    changeModel,
    loadSessions
  };
}