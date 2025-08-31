import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Workspace, Epic } from '@/types';
import { Plus, Hash, Circle } from 'lucide-react';

interface EpicSidebarProps {
  workspace: Workspace;
}

const EPIC_COLORS = [
  { name: 'purple', value: '#8B5CF6' },
  { name: 'blue', value: '#3B82F6' },
  { name: 'green', value: '#10B981' },
  { name: 'orange', value: '#F59E0B' },
  { name: 'pink', value: '#EC4899' },
];

export const EpicSidebar: React.FC<EpicSidebarProps> = ({ workspace }) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [newEpicName, setNewEpicName] = useState('');
  const [showNewEpicInput, setShowNewEpicInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const sidebar = useSidebar();
  const collapsed = sidebar?.state === 'collapsed';
  const { toast } = useToast();

  useEffect(() => {
    fetchEpics();
  }, [workspace.id]);

  const fetchEpics = async () => {
    try {
      const { data, error } = await supabase
        .from('epics')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at');

      if (error) throw error;
      setEpics(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching epics',
        description: error?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const createEpic = async () => {
    if (!newEpicName.trim()) return;

    try {
      const randomColor = EPIC_COLORS[Math.floor(Math.random() * EPIC_COLORS.length)];
      
      const { data, error } = await supabase
        .from('epics')
        .insert({
          workspace_id: workspace.id,
          name: newEpicName.trim(),
          color: randomColor.value,
        })
        .select()
        .single();

      if (error) throw error;

      setEpics(prev => [...prev, data]);
      setNewEpicName('');
      setShowNewEpicInput(false);
      
      toast({
        title: 'Epic created',
        description: `${data.name} is ready for prompts!`
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating epic',
        description: error?.message
      });
    }
  };

  const getPromptCount = (epicId: string) => {
    // TODO: Implement prompt counting per epic
    return 0;
  };

  return (
    <Sidebar className={`border-r border-border ${collapsed ? 'w-14' : 'w-64'}`}>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && 'Epics & Features'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {/* All Prompts */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setSelectedEpicId(null)}
                  isActive={selectedEpicId === null}
                  className="w-full justify-start"
                >
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">All Prompts</span>
                      <Badge variant="secondary" className="text-xs">
                        {epics.reduce((acc, epic) => acc + getPromptCount(epic.id), 0)}
                      </Badge>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Epic List */}
              {epics.map((epic) => (
                <SidebarMenuItem key={epic.id}>
                  <SidebarMenuButton 
                    onClick={() => setSelectedEpicId(epic.id)}
                    isActive={selectedEpicId === epic.id}
                    className="w-full justify-start"
                  >
                    <Circle 
                      className="w-4 h-4" 
                      style={{ color: epic.color }}
                      fill="currentColor"
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{epic.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getPromptCount(epic.id)}
                        </Badge>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Add New Epic */}
              {showNewEpicInput && !collapsed ? (
                <SidebarMenuItem>
                  <div className="px-3 py-1">
                    <Input
                      autoFocus
                      placeholder="Epic name..."
                      value={newEpicName}
                      onChange={(e) => setNewEpicName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') createEpic();
                        if (e.key === 'Escape') {
                          setShowNewEpicInput(false);
                          setNewEpicName('');
                        }
                      }}
                      onBlur={() => {
                        if (newEpicName.trim()) {
                          createEpic();
                        } else {
                          setShowNewEpicInput(false);
                        }
                      }}
                      className="text-sm"
                    />
                  </div>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewEpicInput(true)}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    {!collapsed && <span>Add Epic</span>}
                  </Button>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};