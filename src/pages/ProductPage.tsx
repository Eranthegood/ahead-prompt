import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { useCursorIntegration } from '@/hooks/useCursorIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { KnowledgeAccessGuard } from '@/components/KnowledgeAccessGuard';
import { useSubscription, canAccessKnowledge } from '@/hooks/useSubscription';
import { PromptCard } from '@/components/PromptCard';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';
import { CursorConfigDialog } from '@/components/CursorConfigDialog';
import { Loader2, Package, Link2, BookOpen, Hash, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Prompt, PromptStatus, Product, Epic } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { copyText } from '@/lib/clipboard';

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { products, loading: productsLoading } = useProducts(workspace?.id);
  const { epics, loading: epicsLoading } = useEpics(workspace?.id, productId);
  const { 
    prompts, 
    loading: promptsLoading,
    updatePromptStatus,
    updatePromptPriority,
    duplicatePrompt,
    deletePrompt,
    updatePrompt
  } = usePrompts(workspace?.id, productId);
  const { sendToCursor, isLoading: cursorLoading } = useCursorIntegration();
  const { toast } = useToast();
  const { tier } = useSubscription();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showPromptDetail, setShowPromptDetail] = useState(false);
  const [showCursorConfig, setShowCursorConfig] = useState(false);
  const [cursorPrompt, setCursorPrompt] = useState<Prompt | null>(null);
  const [hoveredPromptId, setHoveredPromptId] = useState<string | null>(null);

  if (workspaceLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!workspace || !productId) {
    return <Navigate to="/" replace />;
  }

  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Product not found</h3>
          <p className="text-muted-foreground mb-4">The requested product could not be found.</p>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const productEpics = epics.filter(epic => epic.product_id === productId);
  const directPrompts = prompts.filter(prompt => prompt.product_id === productId && !prompt.epic_id);
  const epicPrompts = prompts.filter(prompt => prompt.epic_id && productEpics.some(epic => epic.id === prompt.epic_id));
  
  const totalPrompts = directPrompts.length + epicPrompts.length;

  // Enhance prompts with product and epic data for PromptCard
  const enhancePrompt = (prompt: Prompt): Prompt & { product?: Product; epic?: Epic } => ({
    ...prompt,
    product: products.find(p => p.id === prompt.product_id),
    epic: epics.find(e => e.id === prompt.epic_id)
  });

  // Callback handlers for PromptCard interactions
  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptDetail(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptDetail(true);
  };

  const handleStatusChange = async (prompt: Prompt, status: PromptStatus) => {
    try {
      await updatePromptStatus(prompt.id, status);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update prompt status',
        variant: 'destructive'
      });
    }
  };

  const handlePriorityChange = async (prompt: Prompt, priority: number) => {
    try {
      await updatePromptPriority(prompt.id, priority);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update prompt priority',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicate = async (prompt: Prompt) => {
    try {
      await duplicatePrompt(prompt);
      toast({
        title: 'Success',
        description: 'Prompt duplicated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate prompt',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (prompt: Prompt) => {
    // The hook already handles toasts and error states
    await deletePrompt(prompt.id);
  };

  const handleCopy = async (prompt: Prompt) => {
    try {
      const ok = await copyText(prompt.description || '');
      if (!ok) throw new Error('Clipboard copy failed');
      toast({
        title: 'Copied',
        description: 'Prompt content copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleCopyGenerated = async (prompt: Prompt) => {
    try {
      const textToCopy = prompt.generated_prompt || prompt.description || '';
      const ok = await copyText(textToCopy);
      if (!ok) throw new Error('Clipboard copy failed');
      
      // Update status to in_progress if copying generated prompt
      if (prompt.status === 'todo') {
        await updatePromptStatus(prompt.id, 'in_progress');
      }
      
      toast({
        title: 'Copied',
        description: 'Generated prompt copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleSendToCursor = (prompt: Prompt) => {
    setCursorPrompt(prompt);
    setShowCursorConfig(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-6">
          <Button variant="ghost" size="sm" asChild className="mr-2 sm:mr-4 p-2 sm:px-3">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </Button>
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: product.color || '#3B82F6' }}
            />
            <h1 className="font-semibold text-sm sm:text-base truncate">{product.name}</h1>
            <Badge variant="secondary" className="text-xs shrink-0">{totalPrompts} prompts</Badge>
          </div>
        </div>
      </div>

      <div className="container py-3 sm:py-6 px-3 sm:px-6">
        <div className="grid gap-6">
          {/* Product Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <Package className="h-6 w-6" />
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <CardDescription className="mt-2">
                      {product.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    {productEpics.length} epics
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {totalPrompts} prompts
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3 h-9 sm:h-10 text-xs sm:text-sm">
              <TabsTrigger value="overview" className="px-2 sm:px-3">Overview</TabsTrigger>
              <TabsTrigger value="epics" className="px-2 sm:px-3">Epics</TabsTrigger>
              <TabsTrigger 
                value="knowledge" 
                className="px-2 sm:px-3"
                disabled={!canAccessKnowledge(tier)}
              >
                Knowledge {!canAccessKnowledge(tier) && <span className="ml-1 text-xs">🔒</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Direct Prompts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Direct Prompts</CardTitle>
                    <CardDescription>
                      Prompts directly associated with this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {promptsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : directPrompts.length > 0 ? (
                      <div className="space-y-3">
                        {directPrompts.slice(0, 3).map((prompt) => (
                          <PromptCard
                            key={prompt.id}
                            prompt={enhancePrompt(prompt)}
                            onPromptClick={handlePromptClick}
                            onEdit={handleEdit}
                            onStatusChange={handleStatusChange}
                            onPriorityChange={handlePriorityChange}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            onCopy={handleCopy}
                            onCopyGenerated={handleCopyGenerated}
                            isHovered={hoveredPromptId === prompt.id}
                            onHover={setHoveredPromptId}
                          />
                        ))}
                        {directPrompts.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            +{directPrompts.length - 3} more prompts
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No direct prompts</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Epic Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Epic Activity</CardTitle>
                    <CardDescription>
                      Latest prompts from product epics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {promptsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : epicPrompts.length > 0 ? (
                      <div className="space-y-3">
                        {epicPrompts.slice(0, 3).map((prompt) => (
                          <PromptCard
                            key={prompt.id}
                            prompt={enhancePrompt(prompt)}
                            onPromptClick={handlePromptClick}
                            onEdit={handleEdit}
                            onStatusChange={handleStatusChange}
                            onPriorityChange={handlePriorityChange}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            onCopy={handleCopy}
                            onCopyGenerated={handleCopyGenerated}
                            isHovered={hoveredPromptId === prompt.id}
                            onHover={setHoveredPromptId}
                          />
                        ))}
                        {epicPrompts.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            +{epicPrompts.length - 3} more prompts
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No epic prompts</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="epics" className="space-y-4">
              {epicsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : productEpics.length > 0 ? (
                <div className="grid gap-4">
                  {productEpics.map((epic) => {
                    const epicPromptsList = prompts.filter(p => p.epic_id === epic.id);
                    return (
                      <Card key={epic.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: epic.color || '#8B5CF6' }}
                              />
                              <CardTitle className="text-base">{epic.name}</CardTitle>
                              <Badge variant="secondary">{epicPromptsList.length} prompts</Badge>
                            </div>
                          </div>
                          {epic.description && (
                            <CardDescription>{epic.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {epicPromptsList.length > 0 ? (
                            <div className="space-y-3">
                              {epicPromptsList.slice(0, 2).map((prompt) => (
                                <PromptCard
                                  key={prompt.id}
                                  prompt={enhancePrompt(prompt)}
                                  onPromptClick={handlePromptClick}
                                  onEdit={handleEdit}
                                  onStatusChange={handleStatusChange}
                                  onPriorityChange={handlePriorityChange}
                                  onDuplicate={handleDuplicate}
                                  onDelete={handleDelete}
                                  onCopy={handleCopy}
                                  onCopyGenerated={handleCopyGenerated}
                                  isHovered={hoveredPromptId === prompt.id}
                                  onHover={setHoveredPromptId}
                                />
                              ))}
                              {epicPromptsList.length > 2 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  +{epicPromptsList.length - 2} more prompts
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No prompts in this epic</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Epics</h3>
                    <p className="text-muted-foreground">This product doesn't have any epics yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="knowledge">
              <KnowledgeAccessGuard>
                <KnowledgeBase workspace={workspace} product={product} />
              </KnowledgeAccessGuard>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      {selectedPrompt && (
        <PromptDetailDialog
          prompt={selectedPrompt}
          open={showPromptDetail}
          onOpenChange={setShowPromptDetail}
          products={products}
          epics={epics}
        />
      )}

      {cursorPrompt && (
        <CursorConfigDialog
          prompt={cursorPrompt}
          isOpen={showCursorConfig}
          onClose={() => {
            setShowCursorConfig(false);
            setCursorPrompt(null);
          }}
          onPromptUpdate={(promptId, updates) => updatePrompt(promptId, updates)}
        />
      )}
    </div>
  );
};

export default ProductPage;