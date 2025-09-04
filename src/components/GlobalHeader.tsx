import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Home, 
  Package, 
  Zap,
  Keyboard,
  Plug,
  Trophy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useGamification } from '@/hooks/useGamification';
import { CommandPalette } from '@/components/CommandPalette';

interface GlobalHeaderProps {
  showSearch?: boolean;
  showSidebarTrigger?: boolean;
}

export function GlobalHeader({ showSearch = true, showSidebarTrigger = false }: GlobalHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { workspace } = useWorkspace();
  const { stats } = useGamification();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowCommandPalette(true);
    }
  };

  const isActivePage = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-full items-center justify-between px-4">
          {/* Barre de recherche */}
          {showSearch && workspace && (
            <div className="flex-1 max-w-lg mx-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search everything... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowCommandPalette(true)}
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Menu utilisateur et actions removed - moved to sidebar */}
        </div>
      </header>

      {/* Command Palette */}
      {workspace && (
        <CommandPalette
          open={showCommandPalette}
          onOpenChange={setShowCommandPalette}
          workspace={workspace}
          injectedQuery={searchQuery}
          onSetSearchQuery={setSearchQuery}
        />
      )}
    </>
  );
}