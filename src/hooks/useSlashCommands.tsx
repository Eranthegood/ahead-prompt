import { useMemo } from 'react';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import type { SlashCommandItem } from '@/extensions/SlashCommandExtension';

interface UseSlashCommandsProps {
  workspaceId: string;
  selectedProductId?: string;
  selectedEpicId?: string;
}

export const useSlashCommands = ({ 
  workspaceId, 
  selectedProductId, 
  selectedEpicId 
}: UseSlashCommandsProps) => {
  const { items: promptLibraryItems, loading } = usePromptLibrary();

  // Convert prompt library items to slash command items
  const templateCommands = useMemo((): SlashCommandItem[] => {
    return promptLibraryItems.map(item => ({
      id: item.id,
      title: item.title,
      description: `Template from library (${item.usage_count} uses)`,
      body: item.body,
      category: item.category,
      tags: item.tags,
      isTemplate: true,
    }));
  }, [promptLibraryItems]);

  // Built-in formatting commands
  const formatCommands = useMemo((): SlashCommandItem[] => [
    {
      id: 'heading1',
      title: 'Heading 1',
      description: 'Large heading for main sections',
      body: '# ',
      category: 'Formatting',
      tags: ['heading', 'h1'],
      isTemplate: false,
    },
    {
      id: 'heading2',
      title: 'Heading 2',
      description: 'Medium heading for subsections',
      body: '## ',
      category: 'Formatting',
      tags: ['heading', 'h2'],
      isTemplate: false,
    },
    {
      id: 'heading3',
      title: 'Heading 3',
      description: 'Small heading for sub-subsections',
      body: '### ',
      category: 'Formatting',
      tags: ['heading', 'h3'],
      isTemplate: false,
    },
    {
      id: 'bullet-list',
      title: 'Bullet List',
      description: 'Create a bulleted list',
      body: '- ',
      category: 'Formatting',
      tags: ['list', 'bullets'],
      isTemplate: false,
    },
    {
      id: 'numbered-list',
      title: 'Numbered List',
      description: 'Create a numbered list',
      body: '1. ',
      category: 'Formatting',
      tags: ['list', 'numbers'],
      isTemplate: false,
    },
    {
      id: 'code-block',
      title: 'Code Block',
      description: 'Insert a code block',
      body: '```\n\n```',
      category: 'Formatting',
      tags: ['code', 'block'],
      isTemplate: false,
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Insert a blockquote',
      body: '> ',
      category: 'Formatting',
      tags: ['quote', 'blockquote'],
      isTemplate: false,
    },
  ], []);

  // Quick prompt templates based on context
  const contextCommands = useMemo((): SlashCommandItem[] => {
    const commands: SlashCommandItem[] = [];
    
    // Add context-aware templates
    if (selectedProductId || selectedEpicId) {
      commands.push({
        id: 'bug-fix-template',
        title: 'Bug Fix Template',
        description: 'Standard bug fix prompt template',
        body: `## Bug Description
Describe the issue you're experiencing.

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Steps to Reproduce
1. 
2. 
3. 

## Additional Context
Any additional information that might help.`,
        category: 'Bug Fix',
        tags: ['bug', 'template', 'issue'],
        isTemplate: false,
      });

      commands.push({
        id: 'feature-template',
        title: 'Feature Template',
        description: 'Standard feature request template',
        body: `## Feature Description
Describe the new feature you want to implement.

## User Story
As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria
- [ ] 
- [ ] 
- [ ] 

## Technical Notes
Any technical considerations or constraints.`,
        category: 'Feature',
        tags: ['feature', 'template', 'story'],
        isTemplate: false,
      });

      commands.push({
        id: 'refactor-template',
        title: 'Refactor Template',
        description: 'Code refactoring prompt template',
        body: `## Refactor Goal
What needs to be refactored and why?

## Current Implementation
Describe the current code structure.

## Proposed Changes
What changes should be made?

## Benefits
- Improved performance
- Better maintainability
- Enhanced readability

## Risks
Any potential risks or breaking changes.`,
        category: 'Refactor',
        tags: ['refactor', 'template', 'code'],
        isTemplate: false,
      });
    }

    return commands;
  }, [selectedProductId, selectedEpicId]);

  // Combine all commands
  const allCommands = useMemo((): SlashCommandItem[] => {
    return [
      ...templateCommands,
      ...contextCommands,
      ...formatCommands,
    ].sort((a, b) => {
      // Prioritize templates from library
      if (a.isTemplate && !b.isTemplate) return -1;
      if (!a.isTemplate && b.isTemplate) return 1;
      
      // Then sort by category and title
      if (a.category !== b.category) {
        return (a.category || '').localeCompare(b.category || '');
      }
      
      return a.title.localeCompare(b.title);
    });
  }, [templateCommands, contextCommands, formatCommands]);

  const handleTemplateSelect = (item: SlashCommandItem) => {
    // Optionally track usage if it's a library template
    if (item.isTemplate && promptLibraryItems.find(p => p.id === item.id)) {
      // Could track usage here if needed
      console.log('Template selected:', item.title);
    }
  };

  return {
    commands: allCommands,
    loading,
    onTemplateSelect: handleTemplateSelect,
  };
};