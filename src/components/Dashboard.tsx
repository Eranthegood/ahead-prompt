import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EpicSidebar } from '@/components/EpicSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { CommandPalette } from '@/components/CommandPalette';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Loader2, Hash, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const { workspace, loading } = useWorkspace();

  // Set up global shortcuts
  useGlobalShortcuts({
    'cmd+k': () => setCommandPaletteOpen(true),
    'ctrl+k': () => setCommandPaletteOpen(true),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load workspace</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        <DashboardHeader workspace={workspace} />
        
        <div className="flex w-full">
          <EpicSidebar workspace={workspace} />
          
          <main className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="board" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Prompt Board
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Knowledge Base
                </TabsTrigger>
              </TabsList>

              <TabsContent value="board">
                <KanbanBoard workspace={workspace} />
              </TabsContent>

              <TabsContent value="knowledge">
                <KnowledgeBase workspace={workspace} />
              </TabsContent>
            </Tabs>
          </main>
        </div>

        <CommandPalette 
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          workspace={workspace}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;