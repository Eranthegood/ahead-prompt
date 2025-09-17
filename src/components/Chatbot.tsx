import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MessageCircle,
  Send,
  Plus,
  Trash2,
  Edit2,
  Bot,
  User,
  Loader2,
  Settings
} from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, ChatSession } from '@/types/chatbot';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatbotProps {
  className?: string;
  sessionId?: string;
}

export function Chatbot({ className, sessionId }: ChatbotProps) {
  const { user } = useAuth();
  const {
    currentSession,
    sessions,
    messages,
    isLoading,
    isTyping,
    selectedModel,
    config,
    createSession,
    sendMessage,
    deleteSession,
    updateSessionTitle,
    switchToSession,
    clearMessages,
    changeModel
  } = useChatbot({ sessionId });

  const [inputMessage, setInputMessage] = useState('');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleCreateSession = async () => {
    await createSession();
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat session?')) {
      await deleteSession(sessionId);
    }
  };

  const handleEditTitle = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitle(session.id);
    setEditTitleValue(session.title);
  };

  const handleSaveTitle = async (sessionId: string) => {
    if (editTitleValue.trim()) {
      await updateSessionTitle(sessionId, editTitleValue.trim());
    }
    setEditingTitle(null);
    setEditTitleValue('');
  };

  const handleCancelEdit = () => {
    setEditingTitle(null);
    setEditTitleValue('');
  };

  const renderMessage = (message: ChatMessage) => (
    <div
      key={message.id}
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        message.role === 'user' 
          ? 'bg-primary/10 ml-8' 
          : 'bg-muted mr-8'
      )}
    >
      <div className="flex-shrink-0">
        {message.role === 'user' ? (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-secondary-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {message.role === 'user' ? 'You' : selectedModel?.name || 'Assistant'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sign in to Chat</h3>
            <p className="text-muted-foreground">
              Please sign in to start using the AI chatbot feature.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar - Sessions List */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat Sessions</h2>
            <Button onClick={handleCreateSession} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* Model Selector */}
          {config && (
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select
                value={selectedModel?.id || ''}
                onValueChange={(value) => {
                  const model = config.availableModels.find(m => m.id === value);
                  if (model) changeModel(model);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {config.availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {model.tier}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No chat sessions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => switchToSession(session)}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-colors group',
                      'hover:bg-muted border',
                      currentSession?.id === session.id 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'bg-background border-transparent'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingTitle === session.id ? (
                          <Input
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onBlur={() => handleSaveTitle(session.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle(session.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="h-6 text-sm"
                            autoFocus
                          />
                        ) : (
                          <h4 className="text-sm font-medium truncate">
                            {session.title}
                          </h4>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {session.model.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditTitle(session, e)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {currentSession?.title || 'AI Chatbot'}
              </h1>
              {selectedModel && (
                <p className="text-sm text-muted-foreground">
                  Powered by {selectedModel.name} • {config?.userTier} plan
                </p>
              )}
            </div>
            {currentSession && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                disabled={messages.length === 0}
              >
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && !currentSession ? (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Welcome to AI Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Start a conversation with our AI assistant. Create a new chat session to begin.
                </p>
                <Button onClick={handleCreateSession}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Start Conversation</h3>
                <p className="text-muted-foreground">
                  Send a message to begin chatting with {selectedModel?.name}.
                </p>
              </div>
            ) : (
              messages.map(renderMessage)
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 p-4 rounded-lg bg-muted mr-8">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {selectedModel?.name || 'Assistant'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  currentSession 
                    ? "Type your message..." 
                    : "Create a new chat session to start messaging"
                }
                disabled={isLoading || !currentSession}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || isLoading || !currentSession}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            {selectedModel && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Using {selectedModel.name} • Max {selectedModel.maxTokens} tokens
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}