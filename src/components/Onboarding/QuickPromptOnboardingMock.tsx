import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Circle, Minus, Maximize2, X, MoreHorizontal, Settings } from 'lucide-react';

// Mock AI Provider logos
const OpenAILogo = () => (
  <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
    <span className="text-white text-xs font-bold">O</span>
  </div>
);

const GPTLogo = () => (
  <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
    <span className="text-white text-xs font-bold">G</span>
  </div>
);

const ProductLogo = () => (
  <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
    <Settings className="w-3 h-3 text-white" />
  </div>
);

// Interactive QuickPrompt dialog mock matching exact screenshot
export default function QuickPromptOnboardingMock() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const interactiveSteps = [
    {
      id: 'title',
      title: '⚡ Instant Title Input',
      content: 'Type your idea instantly. This field auto-focuses when dialog opens with Q shortcut!',
      style: { top: '-80px', left: '50px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'status',
      title: '📋 Status Selection',
      content: 'Default is Todo. Click to cycle through Todo → In Progress → Done states.',
      style: { top: '-80px', left: '80px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'priority',
      title: '🔥 Priority Levels',
      content: 'Normal by default. Click to set High/Normal/Low. High priority prompts appear first!',
      style: { top: '-80px', left: '180px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'provider',
      title: '🤖 AI Provider',
      content: 'Choose your AI provider. OpenAI, Claude, or others. Smart defaults based on your setup.',
      style: { top: '-80px', left: '280px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'model',
      title: '🚀 AI Model',
      content: 'Select specific model. GPT-4, Claude Sonnet, etc. Flagship models for best results!',
      style: { top: '-80px', left: '380px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'product',
      title: '📁 Product Context',
      content: 'Organize by product/project. Helps categorize and provides relevant context.',
      style: { top: '-80px', left: '480px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'create',
      title: '💾 Create & Go',
      content: 'One click saves your prompt. Dialog closes instantly, ready for your next idea!',
      style: { bottom: '-80px', right: '30px' },
      arrowClass: 'top-[-4px] right-6'
    }
  ];

  const showTooltip = (stepId: string) => {
    setActiveTooltip(stepId);
    setTimeout(() => setActiveTooltip(null), 4000);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Mock Quick Prompt Dialog - Exact Screenshot Recreation */}
        <div className="relative">
          <div className="rounded-lg bg-gray-900 text-white shadow-2xl max-w-4xl mx-auto border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <Settings className="w-5 h-5" />
                <span className="text-sm">Workspace</span>
                <span className="text-gray-500">›</span>
                <span className="text-white font-medium">New Prompt</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-8">
              {/* Title Input Area */}
              <div className="space-y-4">
                <h1 className="text-3xl font-light text-gray-200">Prompt title</h1>
                
                {/* Control Bar */}
                <div className="flex items-center gap-4 py-4">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">Todo</span>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-300 text-sm">Normal</span>
                  </div>

                  {/* AI Provider */}
                  <div className="flex items-center gap-2">
                    <OpenAILogo />
                    <span className="text-gray-300 text-sm">Openai</span>
                  </div>

                  {/* Model */}
                  <div className="flex items-center gap-2">
                    <GPTLogo />
                    <span className="text-gray-300 text-sm">GPT-5 (Flagship)</span>
                  </div>

                  {/* Product */}
                  <div className="flex items-center gap-2">
                    <ProductLogo />
                    <span className="text-gray-300 text-sm">Product</span>
                  </div>

                  {/* More Options */}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Empty space for content */}
              <div className="h-40"></div>

              {/* Create Button */}
              <div className="flex justify-end">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2">
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
              <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-xl max-w-64 text-xs border border-primary/20">
                <div className="font-semibold mb-1">{step.title}</div>
                <div className="leading-relaxed">{step.content}</div>
                
                {/* Arrow pointer */}
                <div className={`absolute w-2 h-2 bg-primary rotate-45 ${step.arrowClass}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive feature buttons */}
        <div className="grid grid-cols-4 gap-2 text-xs">
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
            <span>Status</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('priority')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'priority' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>Priority</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('provider')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'provider' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>AI Provider</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('model')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'model' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>Model</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('product')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'product' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <span>Product</span>
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
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Q</kbd> anywhere to instantly open this dialog. Perfect for capturing ideas during AI wait times!
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}