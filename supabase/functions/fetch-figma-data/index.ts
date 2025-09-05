import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FigmaFileResponse {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  document: {
    id: string;
    name: string;
    type: string;
    children: any[];
  };
  components: Record<string, any>;
  styles: Record<string, any>;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  cornerRadius?: number;
  characters?: string;
  style?: any;
  componentId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileKey, workspaceId } = await req.json();
    
    if (!fileKey || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'File key and workspace ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Get user's Figma integration to get the token
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'figma')
      .eq('is_enabled', true)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Figma integration not found or not enabled' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Note: In a real implementation, we would need to securely store the Figma token
    // For now, we'll use a placeholder approach
    const figmaToken = Deno.env.get('FIGMA_ACCESS_TOKEN');
    
    if (!figmaToken) {
      return new Response(
        JSON.stringify({ error: 'Figma access token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching Figma file data:', fileKey);

    // Fetch file data from Figma API
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': figmaToken,
      },
    });

    if (!fileResponse.ok) {
      console.error('Failed to fetch Figma file:', fileResponse.status, fileResponse.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Figma file' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const fileData: FigmaFileResponse = await fileResponse.json();
    
    // Extract design elements
    const extractNodes = (nodes: FigmaNode[], parentPath = ''): any[] => {
      const elements: any[] = [];
      
      for (const node of nodes) {
        const nodePath = parentPath ? `${parentPath} > ${node.name}` : node.name;
        
        // Extract different types of design elements
        let elementType = 'frame';
        let specs: any = {};
        
        switch (node.type) {
          case 'COMPONENT':
          case 'COMPONENT_SET':
            elementType = 'component';
            specs = {
              componentId: node.componentId,
              description: `Component: ${node.name}`,
            };
            break;
            
          case 'TEXT':
            elementType = 'text';
            specs = {
              content: node.characters,
              style: node.style,
              fontSize: node.style?.fontSize,
              fontFamily: node.style?.fontFamily,
              textAlign: node.style?.textAlignHorizontal,
            };
            break;
            
          case 'RECTANGLE':
          case 'ELLIPSE':
          case 'POLYGON':
            elementType = 'component';
            specs = {
              fills: node.fills,
              strokes: node.strokes,
              effects: node.effects,
              cornerRadius: node.cornerRadius,
              colors: node.fills?.map((fill: any) => fill.color).filter(Boolean),
            };
            break;
            
          case 'FRAME':
          case 'GROUP':
          default:
            elementType = 'frame';
            specs = {
              type: node.type,
              path: nodePath,
              childrenCount: node.children?.length || 0,
            };
            break;
        }
        
        elements.push({
          node_id: node.id,
          element_type: elementType,
          name: node.name,
          description: specs.description || `${node.type}: ${node.name}`,
          specs: specs,
          figma_url: `https://www.figma.com/file/${fileKey}?node-id=${node.id}`,
        });
        
        // Recursively process children
        if (node.children && node.children.length > 0) {
          elements.push(...extractNodes(node.children, nodePath));
        }
      }
      
      return elements;
    };

    // Extract design elements from the document
    const designElements = extractNodes(fileData.document.children);
    
    // Extract components
    const components = Object.entries(fileData.components || {}).map(([id, component]: [string, any]) => ({
      node_id: id,
      element_type: 'component',
      name: component.name,
      description: component.description || `Component: ${component.name}`,
      specs: {
        componentId: id,
        componentSetId: component.componentSetId,
        documentationLinks: component.documentationLinks,
      },
      figma_url: `https://www.figma.com/file/${fileKey}?node-id=${id}`,
    }));
    
    // Extract styles
    const styles = Object.entries(fileData.styles || {}).map(([id, style]: [string, any]) => ({
      node_id: id,
      element_type: 'style',
      name: style.name,
      description: `Style: ${style.styleType} - ${style.name}`,
      specs: {
        styleType: style.styleType,
        description: style.description,
      },
      figma_url: `https://www.figma.com/file/${fileKey}`,
    }));

    // Store or update Figma project
    const { data: figmaProject, error: projectError } = await supabase
      .from('figma_projects')
      .upsert({
        user_id: user.id,
        figma_file_key: fileKey,
        figma_file_name: fileData.name,
        thumbnail_url: fileData.thumbnailUrl,
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error storing Figma project:', projectError);
      throw new Error('Failed to store Figma project');
    }

    // Combine all design elements
    const allElements = [...designElements, ...components, ...styles];
    
    // Store design elements (limit to avoid overwhelming the database)
    const elementsToStore = allElements.slice(0, 50).map(element => ({
      ...element,
      project_id: figmaProject.id,
      workspace_id: workspaceId,
    }));
    
    // Delete existing elements for this project
    await supabase
      .from('figma_design_elements')
      .delete()
      .eq('project_id', figmaProject.id);
    
    // Insert new elements
    if (elementsToStore.length > 0) {
      const { error: elementsError } = await supabase
        .from('figma_design_elements')
        .insert(elementsToStore);
      
      if (elementsError) {
        console.error('Error storing design elements:', elementsError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        project: figmaProject,
        elementsCount: allElements.length,
        elementsStored: elementsToStore.length,
        elements: elementsToStore,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in fetch-figma-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});