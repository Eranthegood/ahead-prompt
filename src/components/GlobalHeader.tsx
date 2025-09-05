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
  Trophy,
  Menu,
  X
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
import chessKnightLogo from "@/assets/chess-knight-logo.png";

interface GlobalHeaderProps {
  showSearch?: boolean;
  showSidebarTrigger?: boolean;
}

export function GlobalHeader({ showSearch = true, showSidebarTrigger = false }: GlobalHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { workspace } = useWorkspace();
  const { stats } = useGamification();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowCommandPalette(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActivePage = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items for authenticated users
  const navItems = [
    { label: 'Dashboard', path: '/build', icon: Home },
    { label: 'Features', path: '/cursor-multi-agent', icon: Zap },
    { label: 'Pricing', path: '/pricing', icon: Package },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-full items-center justify-between px-4">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center gap-4">
            {/* Sidebar Trigger for authenticated users */}
            {showSidebarTrigger && (
              <SidebarTrigger className="md:hidden" />
            )}
            
            {/* Logo - Hidden on /build route */}
            {location.pathname !== '/build' && (
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => navigate('/')}
              >
                <img 
                  src={chessKnightLogo} 
                  alt="Ahead Logo" 
                  className="w-8 h-8"
                />
                <div className="font-mono text-lg font-bold text-primary">
                  Ahead
                </div>
              </div>
            )}

            {/* Desktop Navigation - only show if not showing sidebar */}
            {!showSidebarTrigger && (
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => handleNavigate(item.path)}
                    className={`text-sm ${isActivePage(item.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            )}
          </div>

          {/* Center - Search Bar */}
          {showSearch && workspace && user && (
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

          {/* Right side - User actions */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              // Authenticated user menu
              <>
                {/* XP Badge for authenticated users */}
                {stats && (
                  <Badge variant="secondary" className="hidden sm:flex">
                    <Trophy className="w-3 h-3 mr-1" />
                    {stats.total_xp} XP
                  </Badge>
                )}

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigate('/shortcuts')}>
                      <Keyboard className="mr-2 h-4 w-4" />
                      Shortcuts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigate('/integrations')}>
                      <Plug className="mr-2 h-4 w-4" />
                      Integrations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigate('/achievements')}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Achievements
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Non-authenticated user actions
              <>
                {/* Mobile menu for non-auth users */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Desktop buttons for non-auth users */}
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" onClick={() => handleNavigate('/cursor-multi-agent')}>
                    Features
                  </Button>
                  <Button variant="ghost" onClick={() => handleNavigate('/pricing')}>
                    Pricing
                  </Button>
                  <Button onClick={() => handleNavigate('/auth')}>
                    Sign In
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu for non-authenticated users */}
        {!user && mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container py-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigate('/cursor-multi-agent')}
              >
                Features
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigate('/pricing')}
              >
                Pricing
              </Button>
              <Button
                className="w-full"
                onClick={() => handleNavigate('/auth')}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Command Palette */}
      {workspace && user && (
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