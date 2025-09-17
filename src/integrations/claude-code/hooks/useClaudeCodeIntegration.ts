import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { ClaudeConfig, ClaudeSession, ClaudeOutputEvent } from '../types/claude-types'
import { toast } from 'sonner'
import { useUserPreferences } from '@/hooks/useUserPreferences'

export const useClaudeCodeIntegration = () => {
  const { preferences } = useUserPreferences()
  const [sessions, setSessions] = useState<Map<string, ClaudeSession>>(new Map())
  const [isExecuting, setIsExecuting] = useState(false)

  // CLI mode functions
  const sendToClaudeCLI = useCallback(async (prompt: string): Promise<void> => {
    try {
      setIsExecuting(true)
      
      const response = await fetch(`${preferences.claudeCliEndpoint}/send-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('✅ Prompt envoyé vers Claude Code !')
        console.log('Réponse:', result)
      } else {
        toast.error('❌ Erreur: ' + result.error)
      }
    } catch (error) {
      toast.error('❌ Connexion au serveur échouée. Vérifiez que le serveur tourne.')
      console.error('Error:', error)
      throw error
    } finally {
      setIsExecuting(false)
    }
  }, [preferences.claudeCliEndpoint])

  const sendToClaudeCode = useCallback(async (
    promptId: string,
    prompt: string,
    config: ClaudeConfig
  ): Promise<string | null> => {
    // Si mode CLI activé, utiliser la fonction CLI
    if (preferences.claudeCliMode) {
      await sendToClaudeCLI(prompt)
      return null // Pas de session ID en mode CLI
    }

    try {
      setIsExecuting(true)
      
      // Validation des paramètres
      if (!config.repository || !prompt.trim()) {
        throw new Error('Repository et prompt sont requis')
      }

      // Création de la session dans Supabase
      const sessionId = `claude_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const { data: session, error: sessionError } = await supabase
        .from('claude_sessions')
        .insert({
          prompt_id: promptId,
          session_id: sessionId,
          status: 'initializing',
          config: config as any,
          output_lines: []
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Conversion du type de session
      const claudeSession: ClaudeSession = {
        ...session,
        config: session.config as unknown as ClaudeConfig
      }

      // Mise à jour de l'état local
      setSessions(prev => new Map(prev.set(sessionId, claudeSession)))

      // Appel de l'Edge Function
      const { data, error } = await supabase.functions.invoke('execute-claude-code', {
        body: {
          sessionId,
          prompt,
          config,
          promptId
        }
      })

      if (error) throw error

      toast.success('Claude Code session démarrée avec succès')
      
      // Démarrage du streaming
      startOutputStreaming(sessionId)

      return sessionId

    } catch (error) {
      console.error('Erreur lors du démarrage Claude Code:', error)
      toast.error(`Erreur: ${error.message}`)
      throw error
    } finally {
      setIsExecuting(false)
    }
  }, [preferences.claudeCliMode, preferences.claudeCliEndpoint, sendToClaudeCLI])

  const startOutputStreaming = useCallback((sessionId: string) => {
    // Subscribe to real-time changes on claude_sessions table
    const subscription = supabase
      .channel(`claude_session_${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'claude_sessions',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        const updatedSession = payload.new as ClaudeSession
        updateSessionFromDB(sessionId, updatedSession)
      })
      .subscribe()

    // Cleanup subscription after 30 minutes
    setTimeout(() => {
      subscription.unsubscribe()
    }, 30 * 60 * 1000)

  }, [])

  const updateSessionFromDB = useCallback((sessionId: string, updatedSession: any) => {
    // Conversion du type de session depuis Supabase
    const claudeSession: ClaudeSession = {
      ...updatedSession,
      config: updatedSession.config as unknown as ClaudeConfig
    }
    setSessions(prev => {
      const current = prev.get(sessionId)
      if (!current) return prev

      // Notify user of status changes
      if (current.status !== claudeSession.status) {
        if (claudeSession.status === 'completed') {
          toast.success('Claude Code terminé avec succès!')
        } else if (claudeSession.status === 'failed') {
          toast.error(`Claude Code échoué: ${claudeSession.error_message || 'Erreur inconnue'}`)
        }
      }

      return new Map(prev.set(sessionId, claudeSession))
    })
  }, [])

  const cancelSession = useCallback(async (sessionId: string) => {
    try {
      // Update session status to failed in database
      const { error } = await supabase
        .from('claude_sessions')
        .update({
          status: 'failed',
          error_message: 'Annulé par l\'utilisateur',
          completed_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (error) throw error
      
      // Update local state
      setSessions(prev => {
        const updated = new Map(prev)
        const session = updated.get(sessionId)
        if (session) {
          updated.set(sessionId, {
            ...session,
            status: 'failed',
            error_message: 'Annulé par l\'utilisateur',
            completed_at: new Date().toISOString()
          })
        }
        return updated
      })

      toast.info('Session Claude Code annulée')
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      toast.error('Erreur lors de l\'annulation')
    }
  }, [])

  const getSession = useCallback((sessionId: string) => {
    return sessions.get(sessionId)
  }, [sessions])

  const getSessionsForPrompt = useCallback((promptId: string) => {
    return Array.from(sessions.values()).filter(s => s.prompt_id === promptId)
  }, [sessions])

  // Load existing sessions for a prompt when component mounts
  const loadSessionsForPrompt = useCallback(async (promptId: string) => {
    try {
      const { data: existingSessions, error } = await supabase
        .from('claude_sessions')
        .select('*')
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (existingSessions) {
        setSessions(prev => {
          const updated = new Map(prev)
          existingSessions.forEach(session => {
            const claudeSession: ClaudeSession = {
              ...session,
              config: session.config as unknown as ClaudeConfig
            }
            updated.set(session.session_id, claudeSession)
          })
          return updated
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
    }
  }, [])

  return {
    sessions: Array.from(sessions.values()),
    isExecuting,
    sendToClaudeCode,
    cancelSession,
    getSession,
    getSessionsForPrompt,
    loadSessionsForPrompt,
    isCliMode: preferences.claudeCliMode
  }
}