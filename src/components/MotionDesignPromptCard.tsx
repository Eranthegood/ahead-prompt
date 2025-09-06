import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Copy, Check, Sparkles, Zap, Play, Pause } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useCursorIntegration } from '@/hooks/useCursorIntegration';
import { CursorConfigDialog } from '@/components/CursorConfigDialog';
import { CursorWorkflowProgress } from '@/components/CursorWorkflowProgress';
import { Prompt, PromptStatus, Product, Epic } from '@/types';
import { cursorTrackingService } from '@/services/cursorTrackingService';
import { isPromptUsable } from '@/lib/utils';

interface MotionDesignPromptCardProps {
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  onPromptClick: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onStatusChange: (prompt: Prompt, status: PromptStatus) => void;
  onCopyGenerated: (prompt: Prompt) => void;
  isHovered?: boolean;
  onHover?: (promptId: string | null) => void;
}

export function MotionDesignPromptCard({
  prompt,
  onPromptClick,
  onEdit,
  onStatusChange,
  onCopyGenerated,
  isHovered,
  onHover
}: MotionDesignPromptCardProps) {
  const [justCopied, setJustCopied] = useState(false);
  const [showCursorDialog, setShowCursorDialog] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { sendToCursor, isLoading: cursorLoading } = useCursorIntegration();
  
  const isUsable = isPromptUsable(prompt);
  const isMotionDesign = prompt.description?.toLowerCase().includes('motion') || 
                        prompt.description?.toLowerCase().includes('animation');

  // Initialize tracking for this motion design prompt
  useEffect(() => {
    if (isMotionDesign) {
      const initializeTracking = async () => {
        try {
          const validation = await cursorTrackingService.validatePreSend(prompt, {
            repository: prompt.product?.github_repo_url || '',
            ref: prompt.product?.default_branch || 'main',
            branchName: `motion-design-${prompt.id.slice(0, 8)}`,
            autoCreatePr: true,
            model: 'claude-4-sonnet'
          });
          
          setTrackingData(validation);
        } catch (error) {
          console.error('Failed to initialize tracking:', error);
        }
      };
      
      initializeTracking();
    }
  }, [prompt.id, isMotionDesign]);

  // Enhanced send to Cursor with comprehensive tracking
  const handleSendToCursor = async () => {
    if (!prompt.product?.github_repo_url) return;

    try {
      const config = {
        repository: prompt.product.github_repo_url,
        ref: prompt.product.default_branch || 'main',
        branchName: `motion-design-${prompt.id.slice(0, 8)}`,
        autoCreatePr: true,
        model: 'claude-4-sonnet'
      };

      // Start comprehensive tracking
      const trackingId = await cursorTrackingService.trackSendProcess(prompt, config);
      
      toast({
        title: '🎬 Sending Motion Design to Cursor',
        description: `Tracking ID: ${trackingId.slice(0, 8)}... | Full audit trail active.`,
      });

      const agent = await sendToCursor(prompt, config);
      
      if (agent) {
        await cursorTrackingService.trackAgentCreated(prompt, agent, trackingId);
        
        toast({
          title: '✨ Motion Design Agent Active',
          description: 'AI agent is now implementing your motion design with full tracking.',
        });
      }
    } catch (error) {
      console.error('Motion design send failed:', error);
      toast({
        title: 'Motion Design Send Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  // Motion-enhanced copy function with tracking
  const handleCopyWithMotion = async () => {
    setJustCopied(true);
    
    // Trigger motion feedback
    if (cardRef.current) {
      cardRef.current.style.transform = 'scale(1.02)';
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transform = 'scale(1)';
        }
      }, 150);
    }

    // Play enhanced feedback sound
    playMotionFeedbackSound();
    
    // Track the copy action
    if (isMotionDesign) {
      // Log motion design specific metrics
      console.log('Motion design prompt copied with enhanced tracking');
    }
    
    onCopyGenerated(prompt);
    
    setTimeout(() => setJustCopied(false), 1200);
  };

  const playMotionFeedbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Enhanced motion design feedback: ascending chirp
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      // Silently fail
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <>
      <Card 
        ref={cardRef}
        className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
          isHovered ? 'ring-2 ring-primary/50 shadow-xl' : ''
        } ${!isUsable ? 'opacity-60' : ''} ${
          isMotionDesign ? 'bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20' : ''
        } ${isAnimating ? 'animate-pulse' : ''}`}
        onMouseEnter={() => onHover?.(prompt.id)}
        onMouseLeave={() => onHover?.(null)}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center'
        }}
      >
        <CardContent className="p-4">
          <div 
            className="flex items-start justify-between"
            onClick={() => onPromptClick(prompt)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {/* Motion Design Indicator */}
                  {isMotionDesign && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Motion Design
                    </Badge>
                  )}
                  
                  {/* Enhanced Tracking Badge */}
                  {trackingData && (
                    <Badge 
                      variant={trackingData.isValid ? "default" : "destructive"} 
                      className="text-xs flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      Tracked
                    </Badge>
                  )}
                </div>
                
                {/* Animation Toggle for Motion Designs */}
                {isMotionDesign && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAnimation();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              
              <h3 className="font-medium text-foreground mb-2 truncate">
                {prompt.title}
              </h3>
              
              <div 
                className="text-sm text-muted-foreground mb-3 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: prompt.description || 'No description' }}
              />

              {/* Motion Design Asset Preview */}
              {isMotionDesign && trackingData?.motionAssets.length > 0 && (
                <div className="mb-3 p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded">
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Motion Assets: {trackingData.motionAssets.join(', ')}
                  </p>
                </div>
              )}

              {/* Tracking Warnings */}
              {trackingData?.warnings && trackingData.warnings.length > 0 && (
                <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  {trackingData.warnings.map((warning: string, index: number) => (
                    <p key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                      ⚠️ {warning}
                    </p>
                  ))}
                </div>
              )}

              <CursorWorkflowProgress
                status={prompt.status}
                cursorAgentId={prompt.cursor_agent_id}
                cursorAgentStatus={prompt.cursor_agent_status}
                githubPrUrl={prompt.github_pr_url}
                githubPrNumber={prompt.github_pr_number}
                cursorBranchName={prompt.cursor_branch_name}
                error={prompt.status === 'error' ? 'Motion design implementation failed' : undefined}
                onViewAgent={() => console.log('View agent')}
                onViewPR={() => prompt.github_pr_url && window.open(prompt.github_pr_url, '_blank')}
                onMergePR={() => console.log('Merge PR')}
                onCancel={() => console.log('Cancel agent')}
              />
            </div>
                
            <div className="flex items-center gap-2 ml-4">
              {/* Enhanced Send to Cursor Button for Motion Designs */}
              {prompt.product?.github_repo_url && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isUsable) return;
                          if (isMotionDesign) {
                            handleSendToCursor();
                          } else {
                            setShowCursorDialog(true);
                          }
                        }}
                        disabled={!isUsable || cursorLoading}
                        className={`h-8 w-8 p-0 transition-all duration-200 ${
                          !isUsable 
                            ? 'opacity-30 cursor-not-allowed' 
                            : isMotionDesign
                              ? 'opacity-80 hover:opacity-100 text-purple-600 hover:text-purple-700 hover:scale-110'
                              : 'opacity-60 hover:opacity-100 text-purple-600 hover:text-purple-700'
                        }`}
                      >
                        <ExternalLink className={`h-4 w-4 ${cursorLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {!isUsable ? 'Description too short' : 
                       isMotionDesign ? 'Send Motion Design to Cursor (Enhanced Tracking)' : 
                       'Send to Cursor'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Enhanced Copy Button with Motion Feedback */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUsable) return;
                        handleCopyWithMotion();
                      }}
                      disabled={!isUsable}
                      className={`h-8 w-8 p-0 transition-all duration-200 ${
                        !isUsable 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {justCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!isUsable ? 'Description too short' : 
                     isMotionDesign ? 'Copy with Motion Feedback' : 'Copy content'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Cursor Config Dialog with Motion Design Presets */}
      <CursorConfigDialog
        isOpen={showCursorDialog}
        onClose={() => setShowCursorDialog(false)}
        onSend={handleSendToCursor}
        prompt={prompt}
        defaultConfig={isMotionDesign ? {
          repository: prompt.product?.github_repo_url || '',
          ref: prompt.product?.default_branch || 'main',
          branchName: `motion-design-${prompt.id.slice(0, 8)}`,
          autoCreatePr: true,
          model: 'claude-4-sonnet' // Best model for complex motion design
        } : undefined}
      />
    </>
  );
}