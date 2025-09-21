import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Circle, CircleDot, CheckCircle, Minus, Flame, Clock, Maximize2, X, MoreHorizontal, Settings, ChevronDown } from 'lucide-react';

// Interactive QuickPrompt dialog mock - compact and interactive
export default function QuickPromptOnboardingMock() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('normal');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-5');
  const [product, setProduct] = useState('product');

  const interactiveSteps = [
    {
      id: 'title',
      title: '⚡ Lightning Title',
      content: 'Auto-focused for instant typing. Press Q and start typing immediately!',
      style: { top: '-70px', left: '20px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'status',
      title: '📋 Smart Status',
      content: 'Click to cycle: Todo → In Progress → Done. Starts with Todo by default.',
      style: { top: '-70px', left: '10px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'priority',
      title: '🔥 Priority Magic',
      content: 'High priority prompts jump to the top of your list automatically!',
      style: { top: '-70px', left: '90px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'create',
      title: '💾 Instant Save',
      content: 'One click and your idea is captured forever. Dialog closes in <100ms!',
      style: { bottom: '-70px', right: '20px' },
      arrowClass: 'top-[-4px] right-6'
    }
  ];

  const showTooltip = (stepId: string) => {
    setActiveTooltip(stepId);
    setTimeout(() => setActiveTooltip(null), 4000);
  };

  const statusOptions = [
    { value: 'todo', label: 'Todo', icon: Circle, color: 'text-gray-400' },
    { value: 'in_progress', label: 'In Progress', icon: CircleDot, color: 'text-blue-500' },
    { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-500' }
  ];

  const priorityOptions = [
    { value: 'high', label: 'High', icon: Flame, color: 'text-red-500' },
    { value: 'normal', label: 'Normal', icon: Minus, color: 'text-orange-500' },
    { value: 'low', label: 'Low', icon: Clock, color: 'text-gray-400' }
  ];

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];
  const currentPriority = priorityOptions.find(p => p.value === priority) || priorityOptions[1];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Compact Interactive Dialog */}
        <div className="relative">
          <div className="rounded-lg bg-gray-900 text-white shadow-xl border border-gray-700 max-w-lg mx-auto">
            {/* Compact Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Settings className="w-4 h-4" />
                <span>Workspace</span>
                <span className="text-gray-500">›</span>
                <span className="text-white">New Prompt</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                  <Maximize2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-gray-200 text-lg font-light">Prompt title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type your idea instantly..."
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  autoFocus
                />
              </div>

              {/* Interactive Controls Bar */}
              <div className="flex items-center gap-3 py-2">
                {/* Status Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 h-auto"
                    >
                      <currentStatus.icon className={`w-4 h-4 ${currentStatus.color}`} />
                      <span className="text-sm">{currentStatus.label}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-600">
                    {statusOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setStatus(option.value)}
                        className="text-gray-300 hover:text-white hover:bg-gray-700 flex items-center gap-2"
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Priority Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 h-auto"
                    >
                      <currentPriority.icon className={`w-4 h-4 ${currentPriority.color}`} />
                      <span className="text-sm">{currentPriority.label}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-600">
                    {priorityOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setPriority(option.value)}
                        className="text-gray-300 hover:text-white hover:bg-gray-700 flex items-center gap-2"
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* AI Provider Badge */}
                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                  <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                  OpenAI
                </Badge>

                {/* Model Badge */}
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                  <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                  GPT-5
                </Badge>

                {/* Product Badge */}
                <Badge variant="outline" className="border-gray-500/30 text-gray-400 bg-gray-500/10">
                  <Settings className="w-3 h-3 mr-1" />
                  Product
                </Badge>
              </div>

              {/* Create Button */}
              <div className="flex justify-end pt-2">
                <Button 
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2"
                  onClick={() => {
                    console.log('Prompt created:', { title, status, priority });
                    setTitle('');
                    setStatus('todo');
                    setPriority('normal');
                  }}
                >
                  Create prompt
                </Button>
              </div>
            </div>
          </div>

          {/* Interactive tooltip overlays */}
          {interactiveSteps.map((step) => (
            <div
              key={step.id}
              className={`absolute transition-all duration-300 ${
                activeTooltip === step.id
                  ? 'opacity-100 scale-100 z-20 animate-scale-in' 
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
              style={step.style}
            >
              <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-xl max-w-60 text-xs border border-primary/20">
                <div className="font-semibold mb-1">{step.title}</div>
                <div className="leading-relaxed">{step.content}</div>
                
                {/* Arrow pointer */}
                <div className={`absolute w-2 h-2 bg-primary rotate-45 ${step.arrowClass}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('title')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'title' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>Title Field</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('status')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'status' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>Status & Priority</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('priority')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'priority' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>AI Provider</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('create')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'create' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>Create Button</span>
          </Button>
        </div>

        {/* Success message */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-3 rounded-lg border border-blue-500/20">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            ⚡ 2-Second Capture
          </p>
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Q</kbd> anywhere → Type → Create. Perfect for those "aha!" moments during AI wait times!
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}