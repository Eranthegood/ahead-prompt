import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  Hash,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Epic } from "@/types";
import { format } from "date-fns";
import { EpicContextMenu } from "@/components/EpicContextMenu";
import { toast } from "@/hooks/use-toast";

interface EpicCardProps {
  epic: Epic;
  promptCount?: number;
  onClick?: () => void;
  onEdit?: (epic: Epic) => void;
  onDelete?: (epicId: string) => void;
  onDuplicate?: (epic: Epic) => void;
  isDragging?: boolean;
}

export function EpicCard({
  epic,
  promptCount = 0,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  isDragging = false,
}: EpicCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(epic);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(epic.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(epic);
  };

  const copyEpicInfo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Epic: ${epic.name}\n${epic.description || ''}`;
    await navigator.clipboard.writeText(text);
  };

  const handleAddPromptContext = () => {
    toast({
      title: "À venir",
      description: "La création de prompt pour cet epic arrive bientôt.",
    });
  };

  const handleToggleCompleteContext = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La clôture d'epics sera bientôt disponible.",
    });
  };

  const handleConfigureGitContext = () => {
    toast({
      title: "Paramètres Git",
      description: "La configuration Git pour cet epic arrive bientôt.",
    });
  };

  return (
    <EpicContextMenu
      epic={epic}
      onAddPrompt={(id) => handleAddPromptContext()}
      onEditEpic={(e) => onEdit?.(e)}
      onDeleteEpic={(e) => onDelete?.(e.id)}
      onConfigureGit={(id) => handleConfigureGitContext()}
      onToggleComplete={(e) => handleToggleCompleteContext()}
    >
      <Card 
        className={`
          group cursor-pointer transition-all duration-200
          ${isDragging ? 'shadow-2xl rotate-3 scale-105' : 'hover:shadow-md'}
          animate-fade-in
        `}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div 
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0" 
                  style={{ backgroundColor: epic.color || '#8B5CF6' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <h4 className="font-medium text-sm line-clamp-2">
                      {epic.name}
                    </h4>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-3 w-3 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyEpicInfo}>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy Info
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {epic.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {epic.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(epic.created_at), 'MMM d')}</span>
              </div>
              
              {promptCount > 0 && (
                <Badge variant="secondary" className="text-xs h-4 px-1.5">
                  <Hash className="h-2 w-2 mr-1" />
                  {promptCount}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </EpicContextMenu>
  );

}