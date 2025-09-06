import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ExternalLink, Check, Hash, Package, Calendar, Flame, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DemoPrompt {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 1 | 2 | 3;
  product: string;
  epic: string;
  date: string;
  type: 'bug' | 'feature' | 'refactor';
}

const demoPrompts: DemoPrompt[] = [
  {
    id: '1',
    title: 'Fix Login Bug',
    description: 'Authentication redirect issue after successful login - users get stuck on loading screen',
    status: 'todo',
    priority: 1,
    product: 'Web App',
    epic: 'Auth System',
    date: 'Queued',
    type: 'bug'
  },
  {
    id: '2', 
    title: 'Add Dark Mode',
    description: 'Implement theme toggle component with system preference detection and smooth transitions',
    status: 'todo',
    priority: 2,
    product: 'Web App',
    epic: 'UI System',
    date: 'Ready',
    type: 'feature'
  },
  {
    id: '3',
    title: 'User Dashboard',
    description: 'Create responsive dashboard with analytics, recent activity, and quick actions panel',
    status: 'in_progress',
    priority: 3,
    product: 'Web App', 
    epic: 'Dashboard',
    date: 'Next',
    type: 'feature'
  }
];

const statusColors = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-[hsl(var(--status-progress))] text-[hsl(var(--status-progress-foreground))]',
  done: 'bg-[hsl(var(--status-done))] text-[hsl(var(--status-done-foreground))]'
};

const priorityConfig = {
  1: { label: 'High', variant: 'destructive' as const, icon: Flame },
  2: { label: 'Medium', variant: 'secondary' as const, icon: null },
  3: { label: 'Normal', variant: 'outline' as const, icon: null }
};

export function InteractivePromptCards() {
  const [prompts, setPrompts] = useState(demoPrompts);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingToCursor, setSendingToCursor] = useState<string | null>(null);
  const [slidingOut, setSlidingOut] = useState<string | null>(null);

  const playSlideSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail if Web Audio API is not supported
    }
  };

  const handleCopy = (prompt: DemoPrompt) => {
    setCopiedId(prompt.id);
    navigator.clipboard.writeText(`${prompt.title}\n\n${prompt.description}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToCursor = (prompt: DemoPrompt) => {
    setSendingToCursor(prompt.id);
    setTimeout(() => {
      setSendingToCursor(null);
      setPrompts(prev => prev.map(p => 
        p.id === prompt.id ? { ...p, status: 'in_progress' as const } : p
      ));
    }, 2000);
  };

  const handleStatusClick = (prompt: DemoPrompt) => {
    if (prompt.status === 'in_progress') {
      playSlideSound();
      setSlidingOut(prompt.id);
      setTimeout(() => {
        setPrompts(prev => prev.map(p => 
          p.id === prompt.id ? { ...p, status: 'done' as const } : p
        ));
        setSlidingOut(null);
      }, 300);
    } else if (prompt.status === 'todo') {
      setPrompts(prev => prev.map(p => 
        p.id === prompt.id ? { ...p, status: 'in_progress' as const } : p
      ));
    } else {
      setPrompts(prev => prev.map(p => 
        p.id === prompt.id ? { ...p, status: 'todo' as const } : p
      ));
    }
  };

  // Reset demo every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrompts(demoPrompts);
      setCopiedId(null);
      setSendingToCursor(null);
      setSlidingOut(null);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 200
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Background Effects */}
      <div className="absolute inset-0 -m-8">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'gridFloat 20s ease-in-out infinite'
            }}
          />
        </div>

        {/* Floating Activity Indicators */}
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/40"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}

        {/* Flow Lines */}
        {[1, 2].map((i) => (
          <motion.div
            key={`flow-${i}`}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            style={{
              width: '200px',
              left: `${25 + i * 30}%`,
              top: `${40 + i * 20}%`,
              transform: `rotate(${i % 2 ? 25 : -25}deg)`
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1.5
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Try the Core Workflow
        </h3>
        <p className="text-muted-foreground text-sm">
          Click the buttons to see how prompts flow through your development process
        </p>
      </motion.div>

      {/* Interactive Cards */}
      <motion.div
        className="flex flex-row gap-4 overflow-x-auto relative z-10 min-w-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {prompts.map((prompt, index) => {
            const priorityInfo = priorityConfig[prompt.priority];
            const isSliding = slidingOut === prompt.id;
            const isSending = sendingToCursor === prompt.id;
            const isCopied = copiedId === prompt.id;

            return (
              <motion.div
                key={prompt.id}
                variants={cardVariants}
                layout
                className={`relative flex-shrink-0 w-80 ${isSliding ? 'animate-slide-out-right' : ''}`}
              >
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden">
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardContent className="p-5 relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1 truncate">
                          {prompt.title}
                        </h4>
                        
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {prompt.priority === 1 && (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              {priorityInfo.label}
                            </Badge>
                          )}
                          {prompt.priority === 2 && (
                            <Badge variant="secondary" className="text-xs">
                              {priorityInfo.label}
                            </Badge>
                          )}
                          {prompt.priority === 3 && (
                            <Badge variant="outline" className="text-xs opacity-60">
                              {priorityInfo.label}
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="text-xs">
                            {prompt.product}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {prompt.epic}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {prompt.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{prompt.product}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>{prompt.epic}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{prompt.date}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Send to Cursor Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendToCursor(prompt)}
                                disabled={isSending || prompt.status !== 'todo'}
                                className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950"
                              >
                                {isSending ? (
                                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <ExternalLink className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {prompt.status === 'todo' ? 'Send to Cursor' : 'Already sent'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Copy Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(prompt)}
                                className="h-8 w-8 p-0 hover:bg-muted"
                              >
                                {isCopied ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isCopied ? 'Copied!' : 'Copy prompt'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Status Badge */}
                      <Badge 
                        variant={
                          prompt.status === 'done' ? 'default' : 
                          prompt.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                        className={`text-xs cursor-pointer hover:opacity-80 transition-all ${
                          prompt.status === 'done' ? statusColors.done :
                          prompt.status === 'in_progress' ? statusColors.in_progress :
                          statusColors.todo
                        }`}
                        onClick={() => handleStatusClick(prompt)}
                      >
                        {prompt.status === 'in_progress' ? 'In Progress' : 
                         prompt.status === 'done' ? 'Done' : 'Todo'}
                      </Badge>
                    </div>

                    {/* Sending Indicator */}
                    {isSending && (
                      <motion.div 
                        className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-primary font-medium">Sending to Cursor...</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Instructions */}
      <motion.div 
        className="text-center mt-8 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <p className="text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ExternalLink className="h-3 w-3 text-purple-600" />
            Send to Cursor
          </span>
          {" • "}
          <span className="inline-flex items-center gap-1">
            <Copy className="h-3 w-3" />
            Copy prompt
          </span>
          {" • "}
          <span>Click status to advance</span>
        </p>
        <p className="text-xs text-muted-foreground/70">
          Demo resets every 10 seconds
        </p>
      </motion.div>

      {/* CSS for grid animation - defined in global styles */}
    </div>
  );
}