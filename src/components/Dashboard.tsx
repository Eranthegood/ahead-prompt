import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EpicSidebar } from '@/components/EpicSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CommandPalette } from '@/components/CommandPalette';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
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
            <KanbanBoard workspace={workspace} />
          </main>
        </div>

        <CommandPalette 
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          workspace={workspace}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;