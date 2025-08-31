import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { Loader2, Package, Link2, BookOpen, Hash, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { products, loading: productsLoading } = useProducts(workspace?.id);
  const { epics, loading: epicsLoading } = useEpics(workspace?.id, productId);
  const { prompts, loading: promptsLoading } = usePrompts(workspace?.id, productId);
  
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: product.color || '#3B82F6' }}
            />
            <h1 className="font-semibold">{product.name}</h1>
            <Badge variant="secondary">{totalPrompts} prompts</Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
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
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="epics">Epics</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
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
                      <div className="space-y-2">
                        {directPrompts.slice(0, 5).map((prompt) => (
                          <div key={prompt.id} className="flex items-center justify-between p-2 rounded-lg border">
                            <span className="text-sm font-medium">{prompt.title}</span>
                            <Badge variant={
                              prompt.status === 'done' ? 'default' : 
                              prompt.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {prompt.status}
                            </Badge>
                          </div>
                        ))}
                        {directPrompts.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{directPrompts.length - 5} more prompts
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
                      <div className="space-y-2">
                        {epicPrompts.slice(0, 5).map((prompt) => {
                          const epic = productEpics.find(e => e.id === prompt.epic_id);
                          return (
                            <div key={prompt.id} className="flex items-center justify-between p-2 rounded-lg border">
                              <div>
                                <span className="text-sm font-medium">{prompt.title}</span>
                                {epic && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: epic.color || '#8B5CF6' }}
                                    />
                                    <span className="text-xs text-muted-foreground">{epic.name}</span>
                                  </div>
                                )}
                              </div>
                              <Badge variant={
                                prompt.status === 'done' ? 'default' : 
                                prompt.status === 'in_progress' ? 'secondary' : 'outline'
                              }>
                                {prompt.status}
                              </Badge>
                            </div>
                          );
                        })}
                        {epicPrompts.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{epicPrompts.length - 5} more prompts
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
                            <div className="space-y-2">
                              {epicPromptsList.slice(0, 3).map((prompt) => (
                                <div key={prompt.id} className="flex items-center justify-between p-2 rounded-lg border">
                                  <span className="text-sm font-medium">{prompt.title}</span>
                                  <Badge variant={
                                    prompt.status === 'done' ? 'default' : 
                                    prompt.status === 'in_progress' ? 'secondary' : 'outline'
                                  }>
                                    {prompt.status}
                                  </Badge>
                                </div>
                              ))}
                              {epicPromptsList.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{epicPromptsList.length - 3} more prompts
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
              <KnowledgeBase workspace={workspace} product={product} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;