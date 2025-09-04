import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  ExternalLink,
  Github,
  Key,
  Zap,
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function CursorIntegration() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/integrations')}
            className="mb-6 -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-muted">
              <img 
                src="/lovable-uploads/5d5ed883-0303-4ec8-9358-b4b6043727a0.png" 
                alt="Cursor logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cursor Integration</h1>
              <p className="text-muted-foreground text-lg">
                Connect Ahead.love with Cursor Background Agents
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* What is Cursor Integration */}
            <Card>
              <CardHeader>
                <CardTitle>What is Cursor Integration?</CardTitle>
                <CardDescription>
                  Send your prompts directly to Cursor Background Agents for autonomous code generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Cursor Background Agents are AI-powered coding assistants that work autonomously on your GitHub repositories. 
                    With this integration, you can send prompts from Ahead.love directly to Cursor, which will:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      Create and edit code files in your repository
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      Make commits with descriptive messages
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      Optionally create pull requests for review
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      Work with advanced AI models (Claude, GPT)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Requirements:</strong> You need a Cursor Pro account and GitHub access to use Background Agents.
              </AlertDescription>
            </Alert>

            {/* Setup Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Guide</CardTitle>
                <CardDescription>
                  Follow these steps to connect Cursor with Ahead.love
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Get Cursor Pro</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Background Agents require a Cursor Pro subscription. Sign up or upgrade your account.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://cursor.com/pricing" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Cursor Pro Plans
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Generate API Key</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        In your Cursor dashboard, go to Settings → API Keys and generate a new API key for Background Agents.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://cursor.com/settings" target="_blank" rel="noopener noreferrer">
                          <Key className="h-4 w-4 mr-2" />
                          Open Cursor Settings
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Configure GitHub</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Cursor agents work on GitHub repositories. Make sure your GitHub integration is configured.
                      </p>
                       <Button variant="outline" size="sm" asChild>
                         <Link to="/integrations">
                           <Github className="h-4 w-4 mr-2" />
                           Setup GitHub Integration
                         </Link>
                       </Button>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Add API Key to Ahead.love</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        The API key is securely stored and encrypted in your Ahead.love account.
                      </p>
                      <Alert className="mb-3">
                        <Key className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Your Cursor API key is already configured and ready to use.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Start Using</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        You're all set! Look for the "Send to Cursor" button on your prompt cards to dispatch agents.
                      </p>
                      <Button size="sm" asChild>
                        <Link to="/">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Go to Dashboard
                        </Link>
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">1. Intelligent Prompt Batching</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Queue related prompts in logical groups</li>
                      <li>• Ahead analyzes dependencies automatically</li>
                      <li>• Creates optimal batches for Cursor Agent processing</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">2. Parallel Execution Engine</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Push entire batch to Cursor with one click</li>
                      <li>• Multiple AI agents work simultaneously</li>
                      <li>• Real-time progress tracking across all tasks</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">3. GitHub Integration</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Automatic branch management for each batch</li>
                      <li>• Commit messages generated from prompt context</li>
                      <li>• Seamless merge coordination between parallel work</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://docs.cursor.com/background-agent" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Cursor Documentation
                  </a>
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://cursor.com/pricing" target="_blank" rel="noopener noreferrer">
                    <Zap className="h-4 w-4 mr-2" />
                    Cursor Pro Plans
                  </a>
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/integrations/github">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub Setup
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Having trouble with the integration? Check these resources:
                </p>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://docs.cursor.com/troubleshooting" target="_blank" rel="noopener noreferrer">
                    <Info className="h-4 w-4 mr-2" />
                    Troubleshooting Guide
                  </a>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}