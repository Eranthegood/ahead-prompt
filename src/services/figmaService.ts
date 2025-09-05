import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FigmaProject {
  id: string;
  user_id: string;
  figma_file_key: string;
  figma_file_name: string;
  team_id?: string;
  team_name?: string;
  thumbnail_url?: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FigmaDesignElement {
  id: string;
  project_id: string;
  node_id: string;
  element_type: string; // Changed from strict union to string
  name: string;
  description?: string;
  specs: Record<string, any>;
  thumbnail_url?: string;
  figma_url?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

export interface FigmaTeam {
  id: string;
  name: string;
}

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

class FigmaService {
  /**
   * Validate Figma Personal Access Token
   */
  async validateToken(token: string): Promise<{
    isValid: boolean;
    user?: FigmaUser;
    teams?: FigmaTeam[];
    recentFiles?: FigmaFile[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-figma-token', {
        body: { token }
      });

      if (error) {
        console.error('Error validating Figma token:', error);
        return { isValid: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in validateToken:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Fetch Figma file data and import to workspace
   */
  async importFigmaFile(fileKey: string, workspaceId: string): Promise<{
    success: boolean;
    project?: FigmaProject;
    elementsCount?: number;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-figma-data', {
        body: { fileKey, workspaceId }
      });

      if (error) {
        console.error('Error importing Figma file:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in importFigmaFile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get user's Figma projects
   */
  async getFigmaProjects(): Promise<FigmaProject[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('figma_projects')
        .select('*')
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching Figma projects:', error);
        toast.error('Failed to load Figma projects');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFigmaProjects:', error);
      toast.error('Failed to load Figma projects');
      return [];
    }
  }

  /**
   * Get design elements for a project
   */
  async getDesignElements(projectId: string): Promise<FigmaDesignElement[]> {
    try {
      const { data, error } = await supabase
        .from('figma_design_elements')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching design elements:', error);
        toast.error('Failed to load design elements');
        return [];
      }

      return (data || []) as FigmaDesignElement[];
    } catch (error) {
      console.error('Error in getDesignElements:', error);
      toast.error('Failed to load design elements');
      return [];
    }
  }

  /**
   * Get design elements for a workspace
   */
  async getWorkspaceDesignElements(workspaceId: string): Promise<FigmaDesignElement[]> {
    try {
      const { data, error } = await supabase
        .from('figma_design_elements')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workspace design elements:', error);
        return [];
      }

      return (data || []) as FigmaDesignElement[];
    } catch (error) {
      console.error('Error in getWorkspaceDesignElements:', error);
      return [];
    }
  }

  /**
   * Delete a Figma project and its elements
   */
  async deleteFigmaProject(projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('figma_projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting Figma project:', error);
        toast.error('Failed to delete Figma project');
        return false;
      }

      toast.success('Figma project deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteFigmaProject:', error);
      toast.error('Failed to delete Figma project');
      return false;
    }
  }

  /**
   * Extract design specs from Figma element for prompt context
   */
  extractDesignContext(elements: FigmaDesignElement[]): string {
    if (!elements.length) return '';

    const context = [];
    context.push('=== FIGMA DESIGN CONTEXT ===\n');

    // Group elements by type
    const elementsByType = elements.reduce((acc, element) => {
      if (!acc[element.element_type]) acc[element.element_type] = [];
      acc[element.element_type].push(element);
      return acc;
    }, {} as Record<string, FigmaDesignElement[]>);

    // Add components
    if (elementsByType.component) {
      context.push('## Components:');
      elementsByType.component.forEach(comp => {
        context.push(`- ${comp.name}: ${comp.description || 'Design component'}`);
        if (comp.specs.colors?.length) {
          context.push(`  Colors: ${comp.specs.colors.join(', ')}`);
        }
      });
      context.push('');
    }

    // Add text styles
    if (elementsByType.text) {
      context.push('## Text Styles:');
      elementsByType.text.forEach(text => {
        const specs = text.specs;
        context.push(`- ${text.name}:`);
        if (specs.fontFamily) context.push(`  Font: ${specs.fontFamily}`);
        if (specs.fontSize) context.push(`  Size: ${specs.fontSize}px`);
        if (specs.textAlign) context.push(`  Align: ${specs.textAlign}`);
      });
      context.push('');
    }

    // Add design system colors/styles
    if (elementsByType.style) {
      context.push('## Design System:');
      elementsByType.style.forEach(style => {
        context.push(`- ${style.name}: ${style.specs.styleType || 'Style'}`);
      });
      context.push('');
    }

    // Add frames/layouts
    if (elementsByType.frame) {
      context.push('## Layouts & Frames:');
      elementsByType.frame.slice(0, 5).forEach(frame => {
        context.push(`- ${frame.name}: ${frame.description || 'Layout frame'}`);
      });
      if (elementsByType.frame.length > 5) {
        context.push(`... and ${elementsByType.frame.length - 5} more frames`);
      }
    }

    context.push('\n=== END FIGMA CONTEXT ===');
    return context.join('\n');
  }

  /**
   * Get formatted Figma file key from URL
   */
  extractFileKeyFromUrl(url: string): string | null {
    const figmaUrlRegex = /figma\.com\/file\/([a-zA-Z0-9]+)/;
    const match = url.match(figmaUrlRegex);
    return match ? match[1] : null;
  }

  /**
   * Validate Figma file URL
   */
  isValidFigmaUrl(url: string): boolean {
    return /^https:\/\/(www\.)?figma\.com\/file\/[a-zA-Z0-9]+/.test(url);
  }
}

export const figmaService = new FigmaService();