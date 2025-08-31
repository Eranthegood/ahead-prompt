import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Bug, Copy, Loader2, AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Workspace } from '@/types';

interface DebugError {
  id: string;
  type: string;
  severity: 'Critical' | 'Warning' | 'Info';
  title: string;
  description: string;
  solution: string;
  codeExample?: string;
  file: string;
  originalError: string;
}

interface DebugAnalysis {
  summary: {
    totalErrors: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
  errors: DebugError[];
}

interface DebugConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export function DebugConsole({ isOpen, onClose, workspace }: DebugConsoleProps) {
  const [consoleInput, setConsoleInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DebugAnalysis | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!consoleInput.trim()) {
      toast({
        title: "Error",
        description: "Please paste console errors to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('debug-console', {
        body: {
          consoleErrors: consoleInput,
          workspaceId: workspace.id
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis complete",
        description: `${data.summary.totalErrors} error(s) analyzed`,
      });
    } catch (error) {
      console.error('Debug analysis error:', error);
      toast({
        title: "Analysis error",
        description: "Unable to analyze console errors",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'destructive';
      case 'Warning':
        return 'secondary';
      case 'Info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleReset = () => {
    setConsoleInput('');
    setAnalysis(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Smart Debugging
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Input Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Console Errors</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isAnalyzing}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!consoleInput.trim() || isAnalyzing}
                  size="sm"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder="Paste console errors here (Ctrl+Shift+I → Console → copy errors)..."
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              className="flex-1 min-h-[200px] font-mono text-sm"
            />

            <div className="mt-3 text-xs text-muted-foreground">
              💡 Open console (F12), copy errors and paste them here for automatic analysis
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1 flex flex-col">
            {analysis ? (
              <>
                {/* Summary */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <h3 className="text-sm font-medium">Analysis Results</h3>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Total: {analysis.summary.totalErrors}
                    </Badge>
                    {analysis.summary.criticalCount > 0 && (
                      <Badge variant="destructive">
                        Critical: {analysis.summary.criticalCount}
                      </Badge>
                    )}
                    {analysis.summary.warningCount > 0 && (
                      <Badge variant="secondary">
                        Warning: {analysis.summary.warningCount}
                      </Badge>
                    )}
                    {analysis.summary.infoCount > 0 && (
                      <Badge variant="outline">
                        Info: {analysis.summary.infoCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Error Cards */}
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-4">
                    {analysis.errors.map((error) => (
                      <Card key={error.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getSeverityIcon(error.severity)}
                              <CardTitle className="text-sm">{error.title}</CardTitle>
                            </div>
                            <div className="flex gap-1">
                              <Badge variant={getSeverityColor(error.severity) as any} className="text-xs">
                                {error.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {error.type}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {error.description}
                          </p>
                          
                          <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Solution:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(error.solution, 'Solution')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            <div className="bg-muted p-3 rounded text-xs">
                              <pre className="whitespace-pre-wrap">{error.solution}</pre>
                            </div>
                          </div>

                          {error.codeExample && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Code:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(error.codeExample!, 'Code')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs">
                                <pre className="whitespace-pre-wrap">{error.codeExample}</pre>
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            📁 File: {error.file}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <Bug className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Paste console errors and click "Analyze"</p>
                  <p className="text-xs mt-1">AI will analyze errors and suggest solutions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}