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
          {/* Logo et navigation principale */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 font-semibold text-lg hover:bg-transparent"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline">Ahead.love</span>
            </Button>

            {/* Navigation rapide */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={isActivePage('/') ? 'secondary' : 'ghost'}
                onClick={() => navigate('/')}
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              
              <Button
                variant={isActivePage('/integrations') ? 'secondary' : 'ghost'}
                onClick={() => navigate('/integrations')}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plug className="w-4 h-4" />
                Integrations
              </Button>
            </nav>
          </div>

          {/* Barre de recherche */}
          {showSearch && workspace && (
            <div className="flex-1 max-w-md mx-4">
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

          {/* Menu utilisateur et actions */}
          <div className="flex items-center gap-3">
            {/* XP Badge */}
            {stats && (
              <div className="hidden sm:flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{stats.total_xp} XP</span>
                <Badge variant="outline" className="text-xs">
                  Lvl {stats.current_level}
                </Badge>
              </div>
            )}

            {/* Menu utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border-border z-50" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/shortcuts')}>
                  <Keyboard className="mr-2 h-4 w-4" />
                  <span>Keyboard Shortcuts</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/achievements')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Achievements</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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