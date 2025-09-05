import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';

export interface PromptEnhancer {
  id: string;
  name: string;
  description: string | null;
  type: 'system' | 'user';
  system_message: string;
  prompt_template: string;
  is_active: boolean;
  created_by: string | null;
  workspace_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromptEnhancerVersion {
  id: string;
  enhancer_id: string;
  version_number: number;
  system_message: string;
  prompt_template: string;
  commit_message: string | null;
  created_at: string;
  created_by: string | null;
}

export interface PromptTestRun {
  id: string;
  enhancer_version_id: string;
  test_input: string;
  test_output: string | null;
  model_used: string;
  max_tokens: number | null;
  temperature: number | null;
  status: string;
  error_message: string | null;
  execution_time: number | null;
  created_at: string;
  workspace_id: string;
}

export function usePromptEnhancers() {
  const [enhancers, setEnhancers] = useState<PromptEnhancer[]>([]);
  const [versions, setVersions] = useState<PromptEnhancerVersion[]>([]);
  const [testRuns, setTestRuns] = useState<PromptTestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { workspace: currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  // Fetch enhancers
  const fetchEnhancers = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_enhancers')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnhancers(data || []);
    } catch (error) {
      console.error('Error fetching enhancers:', error);
      toast({
        title: "Error",
        description: "Failed to load prompt enhancers",
        variant: "destructive",
      });
    }
  };

  // Fetch versions for an enhancer
  const fetchVersions = async (enhancerId: string) => {
    try {
      const { data, error } = await supabase
        .from('prompt_enhancer_versions')
        .select('*')
        .eq('enhancer_id', enhancerId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: "Error",
        description: "Failed to load versions",
        variant: "destructive",
      });
      return [];
    }
  };

  // Create new enhancer
  const createEnhancer = async (enhancer: Omit<PromptEnhancer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'workspace_id'>) => {
    if (!currentWorkspace?.id || !user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('prompt_enhancers')
        .insert({
          ...enhancer,
          workspace_id: currentWorkspace.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial version
      await createVersion(data.id, {
        system_message: enhancer.system_message,
        prompt_template: enhancer.prompt_template,
        commit_message: 'Initial version'
      });

      await fetchEnhancers();
      toast({
        title: "Success",
        description: "Prompt enhancer created successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating enhancer:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create enhancer",
        variant: "destructive",
      });
      return null;
    }
  };

  // Duplicate enhancer
  const duplicateEnhancer = async (originalId: string, newName: string) => {
    if (!currentWorkspace?.id || !user?.id) return null;

    try {
      const original = enhancers.find(e => e.id === originalId);
      if (!original) throw new Error('Original enhancer not found');

      const { data, error } = await supabase
        .from('prompt_enhancers')
        .insert({
          name: newName,
          description: `Copy of ${original.name}`,
          type: 'user' as const,
          system_message: original.system_message,
          prompt_template: original.prompt_template,
          workspace_id: currentWorkspace.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial version
      await createVersion(data.id, {
        system_message: original.system_message,
        prompt_template: original.prompt_template,
        commit_message: `Duplicated from ${original.name}`
      });

      await fetchEnhancers();
      toast({
        title: "Success",
        description: "Enhancer duplicated successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error duplicating enhancer:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to duplicate enhancer",
        variant: "destructive",
      });
      return null;
    }
  };

  // Create new version
  const createVersion = async (enhancerId: string, versionData: {
    system_message: string;
    prompt_template: string;
    commit_message?: string;
  }) => {
    if (!user?.id) return null;

    try {
      const existingVersions = await fetchVersions(enhancerId);
      const nextVersionNumber = Math.max(0, ...existingVersions.map(v => v.version_number)) + 1;

      const { data, error } = await supabase
        .from('prompt_enhancer_versions')
        .insert({
          enhancer_id: enhancerId,
          version_number: nextVersionNumber,
          created_by: user.id,
          ...versionData,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchVersions(enhancerId);
      toast({
        title: "Success",
        description: "New version created successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating version:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create version",
        variant: "destructive",
      });
      return null;
    }
  };

  // Test prompt enhancer
  const testEnhancer = async (versionId: string, testInput: string, config?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) => {
    if (!currentWorkspace?.id) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('test-prompt-enhancer', {
        body: {
          enhancerVersionId: versionId,
          testInput,
          workspaceId: currentWorkspace.id,
          ...config,
        },
      });

      if (error) throw error;

      toast({
        title: "Success", 
        description: "Prompt test completed successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error testing enhancer:', error);
      toast({
        title: "Error",
        description: "Failed to test enhancer",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete enhancer
  const deleteEnhancer = async (enhancerId: string) => {
    try {
      const { error } = await supabase
        .from('prompt_enhancers')
        .update({ is_active: false })
        .eq('id', enhancerId);

      if (error) throw error;

      await fetchEnhancers();
      toast({
        title: "Success",
        description: "Enhancer deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting enhancer:', error);
      toast({
        title: "Error",
        description: "Failed to delete enhancer",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchEnhancers().finally(() => setLoading(false));
    }
  }, [currentWorkspace?.id]);

  return {
    enhancers,
    versions,
    testRuns,
    loading,
    fetchEnhancers,
    fetchVersions,
    createEnhancer,
    duplicateEnhancer,
    createVersion,
    testEnhancer,
    deleteEnhancer,
  };
}