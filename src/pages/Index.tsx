import Dashboard from "@/components/Dashboard";
import { useWorkspace } from "@/hooks/useWorkspace";
import { PromptsProvider } from "@/context/PromptsContext";

const Index = () => {
  const { workspace, loading } = useWorkspace();
  
  // Only render PromptsProvider when workspace is loaded
  if (loading || !workspace) {
    return <Dashboard />;
  }
  
  return (
    <PromptsProvider workspaceId={workspace.id}>
      <Dashboard />
    </PromptsProvider>
  );
};

export default Index;