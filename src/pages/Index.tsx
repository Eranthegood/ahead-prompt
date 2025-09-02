import Dashboard from "@/components/Dashboard";
import { useWorkspace } from "@/hooks/useWorkspace";
import { PromptsProvider } from "@/context/PromptsContext";

const Index = () => {
  const { workspace } = useWorkspace();
  
  return (
    <PromptsProvider workspaceId={workspace?.id}>
      <Dashboard />
    </PromptsProvider>
  );
};

export default Index;