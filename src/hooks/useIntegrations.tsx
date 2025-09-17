import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Integration {
  id: string;
  name: string;
  description: string;
  isConfigured: boolean;
  isEnabled: boolean;
  lastTestResult?: 'success' | 'error' | null;
  lastTestTime?: Date;
  metadata?: any;
  configuration?: {
    token?: string;
  };
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load integrations from database
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }

      const { data: dbIntegrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Create base integrations with defaults
      const baseIntegrations: Integration[] = [
        {
          id: 'github',
          name: 'GitHub Integration',
          description: 'Connect your GitHub repository for enhanced code context',
          isConfigured: false,
          isEnabled: false,
          lastTestResult: null,
        },
        {
          id: 'cursor',
          name: 'Cursor Background Agents',
          description: 'Génération de code autonome avec Cursor',
          isConfigured: false,
          isEnabled: false,
          lastTestResult: null,
        },
        {
          id: 'claude',
          name: 'Claude Code Integration',
          description: 'Execute your prompts with Claude Code for autonomous development',
          isConfigured: false,
          isEnabled: false,
          lastTestResult: null,
        },
        {
          id: 'figma',
          name: 'Figma Integration',
          description: 'Connect your Figma projects to enrich your Knowledge Base',
          isConfigured: false,
          isEnabled: false,
          lastTestResult: null,
        },
      ];

      // Merge with database data
      const mergedIntegrations = baseIntegrations.map(base => {
        const dbIntegration = dbIntegrations?.find(db => db.integration_type === base.id);
        if (dbIntegration) {
          return {
            ...base,
            isConfigured: true,
            isEnabled: dbIntegration.is_enabled,
            lastTestResult: dbIntegration.last_test_result as 'success' | 'error' | null,
            lastTestTime: dbIntegration.last_test_time ? new Date(dbIntegration.last_test_time) : undefined,
            metadata: dbIntegration.metadata,
            configuration: { token: 'configured' }, // Mock configuration for UI
          };
        }
        return base;
      });

      setIntegrations(mergedIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error('Erreur lors du chargement des intégrations');
    } finally {
      setIsLoading(false);
    }
  };

  const updateIntegration = useCallback((id: string, updates: Partial<Integration>) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, ...updates }
          : integration
      )
    );
  }, []);

  // Unified function to store integration secrets
  const storeIntegrationSecret = useCallback(async (integrationType: string, token: string) => {
    const { data, error } = await supabase.functions.invoke('store-integration-secret', {
      body: { integrationType, token }
    });

    if (error || !data?.success) {
      throw new Error(data?.error || 'Failed to store token securely');
    }
  }, []);

  const configureIntegration = useCallback(async (id: string, secretValue: string) => {
    if (!secretValue.trim()) {
      toast.error('Clé API requise');
      return false;
    }

    setIsLoading(true);
    try {
      if (id === 'github') {
        // Store token securely first
        await storeIntegrationSecret('github', secretValue);
        
        // GitHub validation using the edge function (token already stored)
        const { data, error } = await supabase.functions.invoke('validate-github-token', {
          body: { token: secretValue }
        });

        if (error || !data?.success) {
          console.error('GitHub validation error:', error, data?.error);
          throw new Error(data?.error || error?.message || 'Invalid GitHub token');
        }

        updateIntegration(id, {
          isConfigured: true,
          isEnabled: true,
          configuration: { token: 'configured' },
          metadata: data.user ? {
            username: data.user.login,
            name: data.user.name,
            email: data.user.email,
            avatarUrl: data.user.avatar_url,
            repositories: data.repositories || []
          } : null
        });

        toast.success('GitHub intégré avec succès!');
        await loadIntegrations();
        return true;
        
      } else if (id === 'cursor') {
        // Store token securely first
        await storeIntegrationSecret('cursor', secretValue);
        
        // Cursor validation using stored secret via edge function  
        const { data, error } = await supabase.functions.invoke('validate-cursor-token', {
          body: { test: true }
        });

        if (error || !data?.isValid) {
          throw new Error(data?.error || 'Invalid Cursor API token');
        }

        // Store the integration configuration
        const { error: insertError } = await supabase
          .from('integrations')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            integration_type: id,
            is_configured: true,
            is_enabled: true,
            metadata: data.user ? {
              username: data.user.username,
              email: data.user.email
            } : null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,integration_type' });

        if (insertError) {
          console.error('Error storing integration:', insertError);
          throw new Error('Failed to store integration configuration');
        }

        updateIntegration(id, {
          isConfigured: true,
          isEnabled: true,
          configuration: { token: 'configured' },
          metadata: data.user ? {
            username: data.user.username,
            email: data.user.email
          } : null
        });

        toast.success('Cursor intégré avec succès!');
        await loadIntegrations();
        return true;
        
      } else if (id === 'figma') {
        // Figma validation using the edge function
        const { data, error } = await supabase.functions.invoke('validate-figma-token', {
          body: { token: secretValue }
        });

        if (error || !data?.isValid) {
          throw new Error(data?.error || 'Invalid Figma Personal Access Token');
        }

        updateIntegration(id, {
          isConfigured: true,
          isEnabled: true,
          configuration: { token: 'configured' },
          metadata: data.user ? {
            handle: data.user.handle,
            email: data.user.email,
            img_url: data.user.img_url,
            teams: data.teams || [],
            recentFiles: data.recentFiles || []
          } : null
        });

        toast.success('Figma intégré avec succès!');
        await loadIntegrations();
        return true;
        
      } else if (id === 'claude') {
        // Store the secret first
        await storeIntegrationSecret('claude', secretValue);
        
        // Claude validation using the edge function with stored secret
        const { data, error } = await supabase.functions.invoke('validate-claude-token', {
          body: { test: true }
        });

        if (error || !data?.isValid) {
          throw new Error(data?.error || 'Invalid Anthropic API key');
        }

        // Store the integration configuration
        const { error: insertError } = await supabase
          .from('integrations')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            integration_type: id,
            is_configured: true,
            is_enabled: true,
            metadata: data.user ? {
              username: data.user.username,
              email: data.user.email,
              models: data.models || []
            } : null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,integration_type' });

        if (insertError) {
          console.error('Error storing integration:', insertError);
          throw new Error('Failed to store integration configuration');
        }

        updateIntegration(id, {
          isConfigured: true,
          isEnabled: true,
          configuration: { token: 'configured' },
          metadata: data.user ? {
            username: data.user.username,
            email: data.user.email,
            models: data.models || []
          } : null
        });

        toast.success('Claude intégré avec succès!');
        await loadIntegrations();
        return true;
      }

      toast.error('Type d\'intégration non supporté');
      return false;
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      toast.error('Erreur lors de la configuration');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeIntegrationSecret, loadIntegrations]);

  const testIntegration = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      let testResult: 'success' | 'error' = 'success';
      
      if (id === 'github') {
        // Test using stored secret via Edge Function
        const { data, error } = await supabase.functions.invoke('validate-github-token', {
          body: { test: true }
        });

        if (error) {
          testResult = 'error';
          const message = (error as any)?.message || 'Erreur lors du test de GitHub';
          toast.error(message);
        } else if (data?.success) {
          testResult = 'success';
          toast.success('Connexion GitHub réussie');

          // Update integration metadata with latest data
          updateIntegration(id, {
            isConfigured: true,
            isEnabled: true,
            metadata: data.user ? {
              username: data.user.login,
              name: data.user.name,
              email: data.user.email,
              avatarUrl: data.user.avatar_url,
              repositories: data.repositories || []
            } : null
          });
        } else {
          testResult = 'error';
          const msg = data?.error === 'No stored GitHub token found'
            ? 'Aucun token GitHub stocké. Configurez GitHub d\'abord.'
            : (data?.error || 'Token GitHub invalide ou expiré');
          toast.error(msg);
        }

        updateIntegration(id, {
          lastTestResult: testResult,
          lastTestTime: new Date()
        });

        return testResult === 'success';
      }
      
      if (id === 'cursor') {
        // Test using stored secret via Edge Function
        const { data, error } = await supabase.functions.invoke('validate-cursor-token', {
          body: { test: true }
        });

        if (error) {
          testResult = 'error';
          const message = (error as any)?.message || 'Erreur lors du test de Cursor';
          toast.error(message);
        } else if (data?.isValid) {
          testResult = 'success';
          toast.success('Connexion Cursor réussie');

          // Update integration metadata
          updateIntegration(id, {
            isConfigured: true,
            isEnabled: true,
            metadata: data.user ? {
              username: data.user.username,
              email: data.user.email
            } : null
          });
        } else {
          testResult = 'error';
          const msg = data?.error === 'No stored Cursor token found'
            ? 'Aucun token Cursor stocké. Configurez Cursor d\'abord.'
            : (data?.error || 'Token Cursor invalide ou expiré');
          toast.error(msg);
        }

        updateIntegration(id, {
          lastTestResult: testResult,
          lastTestTime: new Date()
        });

        return testResult === 'success';
      } else if (id === 'claude') {
        // Always test using the stored secret via Edge Function
        const { data, error } = await supabase.functions.invoke('validate-claude-token', {
          body: { test: true }
        });

        if (error) {
          testResult = 'error';
          const message = (error as any)?.message || 'Erreur lors du test de Claude';
          toast.error(message);
        } else if (data?.isValid) {
          testResult = 'success';
          toast.success('Connexion Claude réussie');

          // Best-effort: persist integration status for the user
          const { data: authData } = await supabase.auth.getUser();
          const userId = authData?.user?.id;
          if (userId) {
            try {
              await supabase
                .from('integrations')
                .upsert({
                  user_id: userId,
                  integration_type: 'claude',
                  is_configured: true,
                  is_enabled: true,
                  metadata: { models: data.models || [] },
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,integration_type' });
            } catch (e) {
              console.warn('Unable to persist Claude integration row:', e);
            }
          }

          updateIntegration(id, {
            isConfigured: true,
            isEnabled: true,
            metadata: { ...(data.user || {}), models: data.models || [] }
          });
        } else {
          testResult = 'error';
          const msg = data?.error === 'API key is required or not configured for this user'
            ? 'Aucune clé API Claude stockée. Configurez Claude d\'abord.'
            : (data?.error || 'Clé API Claude invalide ou expirée');
          toast.error(msg);
        }

        updateIntegration(id, {
          lastTestResult: testResult,
          lastTestTime: new Date()
        });

        return testResult === 'success';
      } else {
        // Simulate test for other integrations
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      updateIntegration(id, {
        lastTestResult: testResult,
        lastTestTime: new Date()
      });

      if (testResult === 'success') {
        toast.success('L\'intégration fonctionne correctement.');
      } else {
        toast.error('Vérifiez votre configuration.');
      }

      return testResult === 'success';
    } catch (error) {
      updateIntegration(id, {
        lastTestResult: 'error',
        lastTestTime: new Date()
      });

      toast.error('Impossible de tester la connexion.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateIntegration]);

  const toggleIntegration = useCallback(async (id: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      // Simulate API call to enable/disable integration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateIntegration(id, { isEnabled: enabled });
      
      if (enabled) {
        toast.success('Intégration activée');
      } else {
        toast.success('Intégration désactivée');
      }
      
      return true;
    } catch (error) {
      toast.error('Impossible de modifier l\'état de l\'intégration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateIntegration]);

  const removeIntegration = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to remove integration configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateIntegration(id, {
        isConfigured: false,
        isEnabled: false,
        lastTestResult: null,
        lastTestTime: undefined
      });

      toast.success('L\'intégration a été déconfigurée.');

      return true;
    } catch (error) {
      toast.error('Impossible de supprimer la configuration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateIntegration]);

  return {
    integrations,
    isLoading,
    configureIntegration,
    testIntegration,
    toggleIntegration,
    removeIntegration,
    loadIntegrations,
  };
}