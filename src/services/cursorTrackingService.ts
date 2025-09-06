import { supabase } from '@/integrations/supabase/client';
import { Prompt, Product, Epic } from '@/types';
import { CursorAgent, CursorIntegrationConfig } from '@/types/cursor';

export interface CursorTrackingEvent {
  id: string;
  prompt_id: string;
  event_type: 'pre_send' | 'send_initiated' | 'agent_created' | 'status_update' | 'pr_created' | 'completed' | 'error';
  timestamp: string;
  data: any;
  duration_ms?: number;
  user_id: string;
  performance_metrics?: {
    memory_usage?: number;
    cpu_usage?: number;
    network_latency?: number;
    animation_fps?: number;
  };
}

export interface MotionDesignMetrics {
  animation_load_time: number;
  svg_processing_time: number;
  interactive_response_time: number;
  total_assets_loaded: number;
  performance_score: number;
}

export interface CursorAuditLog {
  id: string;
  prompt_id: string;
  action: string;
  status: string;
  timestamp: string;
  metadata: any;
  error_details?: string;
  success: boolean;
}

class CursorTrackingService {
  private trackingEvents: CursorTrackingEvent[] = [];
  private auditLogs: CursorAuditLog[] = [];
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.initializePerformanceTracking();
  }

  private initializePerformanceTracking() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('cursor') || entry.name.includes('motion')) {
            this.trackPerformanceMetric(entry);
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }

  // Phase 1: Pre-Send Validation & Setup
  async validatePreSend(prompt: Prompt, config: CursorIntegrationConfig): Promise<{
    isValid: boolean;
    warnings: string[];
    motionAssets: string[];
  }> {
    const startTime = performance.now();
    
    try {
      const event: CursorTrackingEvent = {
        id: crypto.randomUUID(),
        prompt_id: prompt.id,
        event_type: 'pre_send',
        timestamp: new Date().toISOString(),
        user_id: prompt.workspace_id, // Using workspace_id as user context
        data: {
          prompt_title: prompt.title,
          repository: config.repository,
          model: config.model,
          validation_start: startTime
        }
      };

      // Validate repository access
      const repoValid = await this.validateRepositoryAccess(config.repository);
      
      // Check motion design assets availability
      const motionAssets = await this.detectMotionDesignAssets(prompt);
      
      // Validate prompt quality for motion design
      const qualityCheck = this.validateMotionDesignPrompt(prompt);
      
      const warnings: string[] = [];
      if (!repoValid) warnings.push('Repository access may be limited');
      if (motionAssets.length === 0) warnings.push('No motion design assets detected');
      if (!qualityCheck.isQualified) warnings.push(qualityCheck.reason || 'Prompt quality insufficient');

      event.data.validation_results = {
        repository_valid: repoValid,
        motion_assets: motionAssets,
        quality_check: qualityCheck,
        warnings
      };
      
      event.duration_ms = performance.now() - startTime;
      
      await this.logEvent(event);
      await this.logAudit({
        prompt_id: prompt.id,
        action: 'pre_send_validation',
        status: warnings.length === 0 ? 'success' : 'warning',
        metadata: event.data,
        success: true
      });

      return {
        isValid: warnings.length === 0,
        warnings,
        motionAssets
      };
    } catch (error) {
      await this.logAudit({
        prompt_id: prompt.id,
        action: 'pre_send_validation',
        status: 'error',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
        error_details: error instanceof Error ? error.stack : undefined
      });
      
      throw error;
    }
  }

  // Phase 2: Send Process Monitoring
  async trackSendProcess(prompt: Prompt, config: CursorIntegrationConfig): Promise<string> {
    const trackingId = crypto.randomUUID();
    const startTime = performance.now();

    const event: CursorTrackingEvent = {
      id: trackingId,
      prompt_id: prompt.id,
      event_type: 'send_initiated',
      timestamp: new Date().toISOString(),
      user_id: prompt.workspace_id,
      data: {
        tracking_id: trackingId,
        config,
        send_start: startTime,
        motion_design_context: this.extractMotionDesignContext(prompt)
      }
    };

    await this.logEvent(event);
    return trackingId;
  }

  // Phase 3: Agent Creation & Status Tracking
  async trackAgentCreated(prompt: Prompt, agent: CursorAgent, trackingId: string): Promise<void> {
    const event: CursorTrackingEvent = {
      id: crypto.randomUUID(),
      prompt_id: prompt.id,
      event_type: 'agent_created',
      timestamp: new Date().toISOString(),
      user_id: prompt.workspace_id,
      data: {
        tracking_id: trackingId,
        agent_id: agent.id,
        agent_status: agent.status,
        repository: agent.repository,
        branch: agent.branch,
        created_at: agent.createdAt
      }
    };

    await this.logEvent(event);
    await this.logAudit({
      prompt_id: prompt.id,
      action: 'agent_created',
      status: 'success',
      metadata: {
        agent_id: agent.id,
        tracking_id: trackingId
      },
      success: true
    });
  }

  // Phase 4: Real-time Status Updates
  async trackStatusUpdate(prompt: Prompt, agent: CursorAgent, previousStatus?: string): Promise<void> {
    const event: CursorTrackingEvent = {
      id: crypto.randomUUID(),
      prompt_id: prompt.id,
      event_type: 'status_update',
      timestamp: new Date().toISOString(),
      user_id: prompt.workspace_id,
      data: {
        agent_id: agent.id,
        previous_status: previousStatus,
        new_status: agent.status,
        files_modified: agent.filesModified,
        logs: agent.logs,
        transition_time: new Date().toISOString()
      }
    };

    await this.logEvent(event);
    
    // Log critical status changes
    if (agent.status === 'COMPLETED' || agent.status === 'FAILED') {
      await this.logAudit({
        prompt_id: prompt.id,
        action: 'critical_status_change',
        status: agent.status === 'COMPLETED' ? 'success' : 'error',
        metadata: {
          final_status: agent.status,
          files_modified: agent.filesModified,
          error: agent.error
        },
        success: agent.status === 'COMPLETED',
        error_details: agent.error
      });
    }
  }

  // Phase 5: Motion Design Implementation Validation
  async validateMotionImplementation(prompt: Prompt, prUrl?: string): Promise<{
    animationsImplemented: string[];
    interactivityScore: number;
    performanceScore: number;
    accessibilityScore: number;
    issues: string[];
  }> {
    const startTime = performance.now();
    
    try {
      const validation = {
        animationsImplemented: [
          'slide-in-animation',
          'hover-interactions',
          'status-transitions',
          'copy-feedback'
        ],
        interactivityScore: 85, // Mock score - would be calculated from actual tests
        performanceScore: 92,
        accessibilityScore: 78,
        issues: [
          'Animation duration may be too fast for accessibility preferences',
          'Consider adding reduced motion support'
        ]
      };

      await this.logAudit({
        prompt_id: prompt.id,
        action: 'motion_implementation_validation',
        status: validation.issues.length === 0 ? 'success' : 'warning',
        metadata: {
          validation_results: validation,
          validation_duration: performance.now() - startTime,
          pr_url: prUrl
        },
        success: true
      });

      return validation;
    } catch (error) {
      await this.logAudit({
        prompt_id: prompt.id,
        action: 'motion_implementation_validation',
        status: 'error',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
        error_details: error instanceof Error ? error.stack : undefined
      });
      
      throw error;
    }
  }

  // Utility Methods
  private async validateRepositoryAccess(repository: string): Promise<boolean> {
    // Mock validation - in real implementation would check GitHub API
    return repository.includes('github.com');
  }

  private async detectMotionDesignAssets(prompt: Prompt): Promise<string[]> {
    const motionKeywords = ['animation', 'motion', 'svg', 'interactive', 'hover', 'transition'];
    const content = (prompt.description || '').toLowerCase();
    
    return motionKeywords.filter(keyword => content.includes(keyword));
  }

  private validateMotionDesignPrompt(prompt: Prompt): { isQualified: boolean; reason?: string } {
    if (!prompt.description || prompt.description.length < 50) {
      return { isQualified: false, reason: 'Prompt description too short for complex motion design' };
    }
    
    if (!prompt.description.toLowerCase().includes('motion') && 
        !prompt.description.toLowerCase().includes('animation')) {
      return { isQualified: false, reason: 'No motion design keywords detected' };
    }
    
    return { isQualified: true };
  }

  private extractMotionDesignContext(prompt: Prompt): any {
    return {
      has_motion_keywords: this.detectMotionDesignAssets(prompt),
      complexity_score: Math.min(10, (prompt.description?.length || 0) / 50),
      interactive_elements: prompt.description?.toLowerCase().includes('button') || 
                          prompt.description?.toLowerCase().includes('click') || 
                          prompt.description?.toLowerCase().includes('hover')
    };
  }

  private trackPerformanceMetric(entry: PerformanceEntry): void {
    console.log('Performance metric:', entry.name, entry.duration);
    // Store performance metrics for analysis
  }

  private async logEvent(event: CursorTrackingEvent): Promise<void> {
    this.trackingEvents.push(event);
    
    // Store in Supabase for persistence
    try {
      await supabase
        .from('cursor_tracking_events')
        .insert({
          id: event.id,
          prompt_id: event.prompt_id,
          event_type: event.event_type,
          timestamp: event.timestamp,
          data: event.data,
          duration_ms: event.duration_ms,
          user_id: event.user_id,
          performance_metrics: event.performance_metrics
        });
    } catch (error) {
      console.error('Failed to log tracking event:', error);
    }
  }

  private async logAudit(audit: Omit<CursorAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: CursorAuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...audit
    };
    
    this.auditLogs.push(auditLog);
    
    // Store in Supabase for persistence
    try {
      await supabase
        .from('cursor_audit_logs')
        .insert(auditLog);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  // Public API for accessing tracking data
  getTrackingEvents(promptId?: string): CursorTrackingEvent[] {
    return promptId 
      ? this.trackingEvents.filter(event => event.prompt_id === promptId)
      : this.trackingEvents;
  }

  getAuditLogs(promptId?: string): CursorAuditLog[] {
    return promptId 
      ? this.auditLogs.filter(log => log.prompt_id === promptId)
      : this.auditLogs;
  }

  async generateTrackingReport(promptId: string): Promise<{
    summary: any;
    events: CursorTrackingEvent[];
    audits: CursorAuditLog[];
    performance: any;
  }> {
    const events = this.getTrackingEvents(promptId);
    const audits = this.getAuditLogs(promptId);
    
    const summary = {
      total_events: events.length,
      total_audits: audits.length,
      success_rate: audits.filter(a => a.success).length / audits.length * 100,
      average_duration: events.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / events.length,
      status_progression: events.map(e => ({ timestamp: e.timestamp, type: e.event_type }))
    };

    return {
      summary,
      events,
      audits,
      performance: {
        // Add performance metrics here
      }
    };
  }
}

export const cursorTrackingService = new CursorTrackingService();