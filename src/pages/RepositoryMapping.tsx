import { useState } from 'react';
import { ArrowLeft, Plus, Settings, Check, X, ExternalLink, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useWorkspace } from '@/hooks/useWorkspace';
import { RepositoryConnectionDialog } from '@/components/RepositoryConnectionDialog';
import { BranchMappingDialog } from '@/components/BranchMappingDialog';

const RepositoryMapping = () => {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { products } = useProducts(workspace?.id);
  const { epics } = useEpics(workspace?.id);
  const [connectingProduct, setConnectingProduct] = useState<{ id: string; name: string } | null>(null);
  const [mappingEpic, setMappingEpic] = useState<{ 
    id: string; 
    name: string; 
    productId: string; 
    repositoryUrl?: string; 
  } | null>(null);

  // Calculate connection status
  const connectedProducts = products.filter(p => p.github_repo_url);
  const connectionStatus = `${connectedProducts.length}/${products.length} connected`;

  const getEpicsForProduct = (productId: string) => {
    return epics.filter(epic => epic.product_id === productId);
  };

  const handleConnectRepository = (productId: string, productName: string) => {
    setConnectingProduct({ id: productId, name: productName });
  };

  const handleMapBranch = (epicId: string, epicName: string, productId: string, repositoryUrl?: string) => {
    setMappingEpic({ id: epicId, name: epicName, productId, repositoryUrl });
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-card">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/integrations')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Integrations
              </Button>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-semibold">Repository</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {connectionStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {products.map((product) => {
            const isConnected = !!product.github_repo_url;
            const productEpics = getEpicsForProduct(product.id);
            
            return (
              <div key={product.id} className="bg-background border rounded-lg overflow-hidden">
                {/* Product Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: product.color || '#3B82F6' }}
                      />
                      <h2 className="text-lg font-semibold">{product.name}</h2>
                    </div>
                    <div className={`flex items-center gap-2 ${getStatusColor(isConnected)}`}>
                      {getStatusIcon(isConnected)}
                      <span className="text-sm font-medium">
                        {isConnected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                  </div>
                  
                  {!isConnected && (
                    <Button 
                      onClick={() => handleConnectRepository(product.id, product.name)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* Repository and Branches */}
                <div className="p-6">
                  {isConnected ? (
                    <div className="space-y-4">
                      {/* Repository URL */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="w-4 h-4" />
                        <span>{product.github_repo_url}</span>
                      </div>
                      
                      {/* Branches */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Branches</h3>
                          <Button 
                            onClick={() => navigate(`/product/${product.id}`)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Créer Epic
                          </Button>
                        </div>
                        
                        {productEpics.length > 0 ? (
                          <div className="space-y-2">
                            {productEpics.map((epic) => (
                              <div 
                                key={epic.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded border"
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: epic.color || '#8B5CF6' }}
                                  />
                                  <span className="font-medium">{epic.name}</span>
                                  {epic.git_branch_name && (
                                    <Badge variant="secondary" className="text-xs">
                                      {epic.git_branch_name}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {epic.git_branch_name ? (
                                    <Badge variant="outline" className="text-xs">
                                      <GitBranch className="w-3 h-3 mr-1" />
                                      Mappée
                                    </Badge>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleMapBranch(epic.id, epic.name, product.id, product.github_repo_url)}
                                      className="text-xs"
                                    >
                                      <GitBranch className="w-3 h-3 mr-1" />
                                      Mapper
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleMapBranch(epic.id, epic.name, product.id, product.github_repo_url)}
                                  >
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No branches configured yet</p>
                            <p className="text-xs mt-1">Create an epic to automatically generate a branch</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="space-y-2">
                        <p className="text-sm">Connect a GitHub repository to start mapping branches</p>
                        <p className="text-xs">Your epics will automatically sync with Git branches</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No products found</p>
              <p className="text-xs mt-1">Create a product first to start mapping repositories</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {connectingProduct && (
        <RepositoryConnectionDialog
          isOpen={!!connectingProduct}
          onClose={() => setConnectingProduct(null)}
          productId={connectingProduct.id}
          productName={connectingProduct.name}
        />
      )}

      {mappingEpic && (
        <BranchMappingDialog
          isOpen={!!mappingEpic}
          onClose={() => setMappingEpic(null)}
          epicId={mappingEpic.id}
          epicName={mappingEpic.name}
          productId={mappingEpic.productId}
          repositoryUrl={mappingEpic.repositoryUrl}
        />
      )}
    </div>
  );
};

export default RepositoryMapping;