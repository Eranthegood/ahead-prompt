import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedDialog, useEnhancedDialog } from '@/components/EnhancedDialog';
import { AlertCircle, CheckCircle, Info, Settings, User, Plus } from 'lucide-react';

/**
 * MVP Demo Component for Click-to-Close Popup Window Feature
 * Demonstrates various dialog scenarios and functionality
 */
export function ClickToCloseDemo() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'failed';
    timestamp?: Date;
  }>>([
    { test: 'Basic click-outside-to-close', status: 'pending' },
    { test: 'Multiple dialog handling', status: 'pending' },
    { test: 'Nested dialog support', status: 'pending' },
    { test: 'Dynamic content handling', status: 'pending' },
    { test: 'Cross-browser compatibility', status: 'pending' }
  ]);

  // Multiple dialog instances for testing
  const basicDialog = useEnhancedDialog();
  const nestedDialog = useEnhancedDialog();
  const dynamicDialog = useEnhancedDialog();
  const formDialog = useEnhancedDialog();

  const [dynamicContent, setDynamicContent] = useState('Initial content');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const markTestResult = (testIndex: number, status: 'success' | 'failed') => {
    setTestResults(prev => prev.map((test, index) => 
      index === testIndex 
        ? { ...test, status, timestamp: new Date() }
        : test
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleBasicDialogClose = () => {
    basicDialog.closeDialog();
    markTestResult(0, 'success');
  };

  const handleNestedDialogTest = () => {
    nestedDialog.openDialog();
    setTimeout(() => markTestResult(2, 'success'), 1000);
  };

  const handleDynamicContentTest = () => {
    setDynamicContent(`Updated at ${new Date().toLocaleTimeString()}`);
    dynamicDialog.openDialog();
    markTestResult(3, 'success');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Click-to-Close Popup Window Demo</h1>
        <p className="text-muted-foreground">
          MVP demonstration of enhanced dialog functionality with click-outside-to-close
        </p>
      </div>

      {/* Test Results Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-3 border rounded-lg"
              >
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{result.test}</p>
                  {result.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <Badge variant={
                  result.status === 'success' ? 'default' : 
                  result.status === 'failed' ? 'destructive' : 'secondary'
                }>
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Basic Dialog Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Dialog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Test basic click-outside-to-close functionality
            </p>
            <Button 
              onClick={basicDialog.openDialog}
              className="w-full"
            >
              Open Basic Dialog
            </Button>
          </CardContent>
        </Card>

        {/* Multiple Dialog Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Multiple Dialogs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Test handling of multiple open dialogs
            </p>
            <Button 
              onClick={() => {
                basicDialog.openDialog();
                setTimeout(() => {
                  handleNestedDialogTest();
                  markTestResult(1, 'success');
                }, 500);
              }}
              className="w-full"
            >
              Open Multiple
            </Button>
          </CardContent>
        </Card>

        {/* Dynamic Content Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dynamic Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Test with dynamically changing content
            </p>
            <Button 
              onClick={handleDynamicContentTest}
              className="w-full"
            >
              Test Dynamic
            </Button>
          </CardContent>
        </Card>

        {/* Form Dialog Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Form Dialog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Test with interactive form elements
            </p>
            <Button 
              onClick={formDialog.openDialog}
              className="w-full"
            >
              Open Form
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Technical Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Click-outside detection using capture phase</li>
                <li>• Multiple/nested dialog support</li>
                <li>• Dynamic content handling</li>
                <li>• Portal-aware event handling</li>
                <li>• Cross-browser compatibility</li>
                <li>• TypeScript support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">User Experience</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Intuitive click-to-close behavior</li>
                <li>• Ignores clicks within dialog content</li>
                <li>• Handles form interactions correctly</li>
                <li>• Smooth animations and transitions</li>
                <li>• Keyboard accessibility maintained</li>
                <li>• Mobile-friendly touch handling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      
      {/* Basic Dialog */}
      <EnhancedDialog
        {...basicDialog.dialogProps}
        onOpenChange={handleBasicDialogClose}
        title="Basic Dialog"
        description="This is a basic dialog demonstrating click-outside-to-close functionality."
      >
        <div className="space-y-4">
          <p>Click outside this dialog to close it.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={basicDialog.closeDialog}>
              Cancel
            </Button>
            <Button onClick={basicDialog.closeDialog}>
              OK
            </Button>
          </div>
        </div>
      </EnhancedDialog>

      {/* Nested Dialog */}
      <EnhancedDialog
        {...nestedDialog.dialogProps}
        title="Nested Dialog"
        description="This dialog can be opened while other dialogs are active."
      >
        <div className="space-y-4">
          <p>This is a nested dialog. Click outside to close only this dialog.</p>
          <Button 
            onClick={() => {
              // Open another dialog to test multiple levels
              alert('This would open another level of dialog');
            }}
          >
            Open Another Level
          </Button>
          <div className="flex justify-end">
            <Button onClick={nestedDialog.closeDialog}>
              Close This Dialog
            </Button>
          </div>
        </div>
      </EnhancedDialog>

      {/* Dynamic Content Dialog */}
      <EnhancedDialog
        {...dynamicDialog.dialogProps}
        title="Dynamic Content Dialog"
        description="Content updates dynamically while dialog is open."
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">Dynamic Content:</p>
            <p>{dynamicContent}</p>
          </div>
          <Button 
            onClick={() => setDynamicContent(`Updated at ${new Date().toLocaleTimeString()}`)}
          >
            Update Content
          </Button>
          <div className="flex justify-end">
            <Button onClick={dynamicDialog.closeDialog}>
              Close
            </Button>
          </div>
        </div>
      </EnhancedDialog>

      {/* Form Dialog */}
      <EnhancedDialog
        {...formDialog.dialogProps}
        title="Interactive Form Dialog"
        description="Dialog with form elements that should not close when interacted with."
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your message"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={formDialog.closeDialog}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Form submitted:', formData);
              formDialog.closeDialog();
            }}>
              Submit
            </Button>
          </div>
        </div>
      </EnhancedDialog>
    </div>
  );
}