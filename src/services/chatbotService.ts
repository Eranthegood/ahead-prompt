import { supabase } from '@/integrations/supabase/client';
import { 
  ChatMessage, 
  ChatSession, 
  ChatbotModel, 
  ChatRequest, 
  ChatResponse,
  CHATBOT_MODELS 
} from '@/types/chatbot';

export class ChatbotService {
  /**
   * Send a chat message to the appropriate AI provider
   */
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { message, sessionId, model, context = [] } = request;
      
      // Create the chat message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        model: model.id
      };

      // Call the appropriate edge function based on the provider
      const response = await supabase.functions.invoke('chat-completion', {
        body: {
          message: userMessage,
          model: model,
          context: context,
          sessionId: sessionId
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Chat service error');
      }

      if (!response.data) {
        throw new Error('No response from chat service');
      }

      return response.data as ChatResponse;
    } catch (error) {
      console.error('ChatbotService.sendMessage error:', error);
      throw error;
    }
  }

  /**
   * Create a new chat session
   */
  static async createSession(userId: string, title: string, model: ChatbotModel): Promise<ChatSession> {
    try {
      const session: ChatSession = {
        id: crypto.randomUUID(),
        userId,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model
      };

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          id: session.id,
          user_id: userId,
          title: session.title,
          model_id: model.id,
          created_at: session.createdAt.toISOString(),
          updated_at: session.updatedAt.toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return session;
    } catch (error) {
      console.error('ChatbotService.createSession error:', error);
      throw error;
    }
  }

  /**
   * Get user's chat sessions
   */
  static async getUserSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages (*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(session => ({
        id: session.id,
        userId: session.user_id,
        title: session.title,
        messages: session.chat_messages?.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          model: msg.model_id
        })) || [],
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
        model: CHATBOT_MODELS[session.model_id] || CHATBOT_MODELS['gpt-4o-mini']
      })) || [];
    } catch (error) {
      console.error('ChatbotService.getUserSessions error:', error);
      throw error;
    }
  }

  /**
   * Save a message to a session
   */
  static async saveMessage(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          id: message.id,
          session_id: sessionId,
          role: message.role,
          content: message.content,
          model_id: message.model,
          created_at: message.timestamp.toISOString()
        }]);

      if (error) {
        throw error;
      }

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('ChatbotService.saveMessage error:', error);
      throw error;
    }
  }

  /**
   * Delete a chat session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      // Delete messages first (due to foreign key constraint)
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      // Delete session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('ChatbotService.deleteSession error:', error);
      throw error;
    }
  }

  /**
   * Update session title
   */
  static async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          title,
          updated_at: new Date().toISOString() 
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('ChatbotService.updateSessionTitle error:', error);
      throw error;
    }
  }
}