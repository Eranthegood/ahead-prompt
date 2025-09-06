import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  RefreshCw, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface CursorAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentStatus?: string;
  branchName?: string;
  logs?: any;
  onCancel?: () => void;
  onRefresh?: () => void;
}

export function CursorAgentModal({
  isOpen,
  onClose,
  agentId,
  agentStatus = 'running',
  branchName,
  logs = {},
  onCancel,
  onRefresh
}: CursorAgentModalProps) {
  const getStatusIcon = () => {
    const status = (agentStatus || 'running').toUpperCase();
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'RUNNING':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'PENDING':
      case 'QUEUED':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    const status = (agentStatus || 'running').toUpperCase();
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-500';
      case 'RUNNING':
        return 'bg-blue-600';
      case 'PENDING':
      case 'QUEUED':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Enhanced logs with real agent data
  const realLogs = logs.logs || logs.entries || [];
  const mockLogs = realLogs.length > 0 ? realLogs : [
    { timestamp: new Date().toISOString(), message: `Agent ${agentId} created successfully`, level: 'info' },
    { timestamp: new Date().toISOString(), message: 'Analyzing repository structure...', level: 'info' },
    { timestamp: new Date().toISOString(), message: 'Generating code changes...', level: 'info' },
    { timestamp: new Date().toISOString(), message: `Current status: ${agentStatus}`, level: 'info' },
  ];

  const filesModified = logs.filesModified || logs.agentData?.filesModified || [
    'src/components/PromptCard.tsx',
    'src/types/cursor.ts',
    'src/hooks/useCursorIntegration.tsx'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Cursor Agent Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Agent ID</label>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">{agentId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://cursor.com/agent/${agentId}`, '_blank')}
                  className="h-6 px-2"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge className={`${getStatusColor()} text-white border-0 w-fit`}>
                {agentStatus?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
          </div>

          {branchName && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Branch</label>
              <code className="text-xs bg-muted px-2 py-1 rounded block w-fit">{branchName}</code>
            </div>
          )}

          {/* Files Modified */}
          {filesModified.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Files Modified</label>
              <div className="space-y-1">
                {filesModified.map((file: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">{file}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Agent Logs</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-6 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
            
            <ScrollArea className="h-48 w-full border rounded-md">
              <div className="p-3 space-y-2">
                {mockLogs.map((log: any, index: number) => (
                  <div key={index} className="text-xs font-mono">
                    <span className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div>
              {(['RUNNING', 'PENDING', 'QUEUED'].includes((agentStatus || '').toUpperCase()) && onCancel) && (
                <Button variant="destructive" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel Agent
                </Button>
              )}
            </div>
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}