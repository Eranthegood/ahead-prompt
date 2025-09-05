import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Copy, Trash2, Play, GitBranch, History, Settings } from 'lucide-react';
import { usePromptEnhancers, type PromptEnhancer, type PromptEnhancerVersion } from '@/hooks/usePromptEnhancers';
import { GeneratingLoader } from '@/components/ui/generating-loader';
import { toast } from 'sonner';

export function PromptEnhancerPanel() {
  const { enhancers, versions, loading, fetchVersions, createEnhancer, duplicateEnhancer, createVersion, testEnhancer, deleteEnhancer } = usePromptEnhancers();
  
  const [selectedEnhancer, setSelectedEnhancer] = useState<PromptEnhancer | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PromptEnhancerVersion | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  // Form states
  const [systemMessage, setSystemMessage] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  
  // Config states
  const [model, setModel] = useState('gpt-4o-mini');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [temperature, setTemperature] = useState(0.7);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [newEnhancerName, setNewEnhancerName] = useState('');
  const [newEnhancerDescription, setNewEnhancerDescription] = useState('');

  const handleSelectEnhancer = async (enhancer: PromptEnhancer) => {
    setSelectedEnhancer(enhancer);
    const enhancerVersions = await fetchVersions(enhancer.id);
    if (enhancerVersions.length > 0) {
      const latestVersion = enhancerVersions[0];
      setSelectedVersion(latestVersion);
      setSystemMessage(latestVersion.system_message);
      setPromptTemplate(latestVersion.prompt_template);
    }
  };

  const handleCreateEnhancer = async () => {
    if (!newEnhancerName.trim()) return;
    
    await createEnhancer({
      name: newEnhancerName,
      description: newEnhancerDescription || null,
      type: 'user',
      system_message: 'You are a helpful AI assistant.',
      prompt_template: 'Please help with: {raw_idea}\n\n{knowledge_context}',
      is_active: true,
      workspace_id: null,
    });
    
    setShowCreateDialog(false);
    setNewEnhancerName('');
    setNewEnhancerDescription('');
  };

  const handleDuplicateEnhancer = async () => {
    if (!selectedEnhancer || !newEnhancerName.trim()) return;
    
    await duplicateEnhancer(selectedEnhancer.id, newEnhancerName);
    setShowDuplicateDialog(false);
    setNewEnhancerName('');
  };

  const handleCommitVersion = async () => {
    if (!selectedEnhancer || !systemMessage.trim() || !promptTemplate.trim()) return;
    
    const newVersion = await createVersion(selectedEnhancer.id, {
      system_message: systemMessage,
      prompt_template: promptTemplate,
      commit_message: commitMessage || 'Updated prompt enhancer',
    });
    
    if (newVersion) {
      setSelectedVersion(newVersion);
      setCommitMessage('');
      toast.success('Version committed successfully');
    }
  };

  const handleTestEnhancer = async () => {
    if (!selectedVersion || !testInput.trim()) return;
    
    setIsTestRunning(true);
    setTestOutput('');
    
    const result = await testEnhancer(selectedVersion.id, testInput, {
      model,
      maxTokens,
      temperature,
    });
    
    if (result?.testOutput) {
      setTestOutput(result.testOutput);
    }
    
    setIsTestRunning(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <GeneratingLoader />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Enhancer List */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Prompt Enhancers</h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Enhancer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newEnhancerName}
                      onChange={(e) => setNewEnhancerName(e.target.value)}
                      placeholder="Enter enhancer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEnhancerDescription}
                      onChange={(e) => setNewEnhancerDescription(e.target.value)}
                      placeholder="Enter description (optional)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateEnhancer}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {enhancers.map((enhancer) => (
              <Card 
                key={enhancer.id}
                className={`cursor-pointer transition-colors ${
                  selectedEnhancer?.id === enhancer.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectEnhancer(enhancer)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{enhancer.name}</h3>
                        <Badge variant={enhancer.type === 'system' ? 'secondary' : 'outline'}>
                          {enhancer.type}
                        </Badge>
                      </div>
                      {enhancer.description && (
                        <p className="text-sm text-muted-foreground">{enhancer.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedEnhancer ? (
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{selectedEnhancer.name}</h1>
                <Badge variant={selectedEnhancer.type === 'system' ? 'secondary' : 'outline'}>
                  {selectedEnhancer.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="test">Test</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                </TabsList>
                
                {selectedEnhancer.type === 'user' && (
                  <div className="flex gap-1">
                    <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Duplicate Enhancer</DialogTitle>
                        </DialogHeader>
                        <div>
                          <Label htmlFor="duplicate-name">New Name</Label>
                          <Input
                            id="duplicate-name"
                            value={newEnhancerName}
                            onChange={(e) => setNewEnhancerName(e.target.value)}
                            placeholder="Enter new name"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleDuplicateEnhancer}>Duplicate</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Enhancer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{selectedEnhancer.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteEnhancer(selectedEnhancer.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="editor" className="h-full p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {/* System Message */}
                  <div className="space-y-2">
                    <Label>System Message</Label>
                    <Textarea
                      value={systemMessage}
                      onChange={(e) => setSystemMessage(e.target.value)}
                      placeholder="Enter system message..."
                      className="h-64 resize-none"
                      disabled={selectedEnhancer.type === 'system'}
                    />
                  </div>
                  
                  {/* Prompt Template */}
                  <div className="space-y-2">
                    <Label>Prompt Template</Label>
                    <Textarea
                      value={promptTemplate}
                      onChange={(e) => setPromptTemplate(e.target.value)}
                      placeholder="Enter prompt template..."
                      className="h-64 resize-none"
                      disabled={selectedEnhancer.type === 'system'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{raw_idea}'} and {'{knowledge_context}'} as placeholders
                    </p>
                  </div>
                  
                  {/* Commit */}
                  <div className="space-y-2">
                    <Label>Commit Changes</Label>
                    <Textarea
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Enter commit message..."
                      className="h-32 resize-none"
                      disabled={selectedEnhancer.type === 'system'}
                    />
                    <Button 
                      onClick={handleCommitVersion}
                      disabled={selectedEnhancer.type === 'system' || !systemMessage.trim() || !promptTemplate.trim()}
                      className="w-full"
                    >
                      <GitBranch className="h-4 w-4 mr-2" />
                      Commit Version
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="test" className="h-full p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="space-y-4">
                    <div>
                      <Label>Test Input</Label>
                      <Textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Enter test input..."
                        className="h-32"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>Model</Label>
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Max Tokens</Label>
                        <Input
                          type="number"
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(Number(e.target.value))}
                          min={100}
                          max={4000}
                        />
                      </div>
                      <div>
                        <Label>Temperature</Label>
                        <Input
                          type="number"
                          value={temperature}
                          onChange={(e) => setTemperature(Number(e.target.value))}
                          min={0}
                          max={2}
                          step={0.1}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleTestEnhancer}
                      disabled={!selectedVersion || !testInput.trim() || isTestRunning}
                      className="w-full"
                    >
                      {isTestRunning ? (
                        <>
                          <GeneratingLoader />
                          Running Test...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Test
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Test Output</Label>
                    <Textarea
                      value={testOutput}
                      readOnly
                      placeholder="Test results will appear here..."
                      className="h-96 resize-none"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="versions" className="h-full p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <Card 
                        key={version.id}
                        className={`cursor-pointer transition-colors ${
                          selectedVersion?.id === version.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedVersion(version);
                          setSystemMessage(version.system_message);
                          setPromptTemplate(version.prompt_template);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">v{version.version_number}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(version.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {version.commit_message && (
                                <p className="text-sm">{version.commit_message}</p>
                              )}
                            </div>
                            <History className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Select a Prompt Enhancer</h2>
              <p className="text-muted-foreground mb-4">Choose an enhancer from the list to start editing</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Enhancer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}