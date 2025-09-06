import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Search, 
  Home, 
  Package, 
  Zap,
  Trophy,
  Menu,
  X
} from 'lucide-react';
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
  const { user, loading } = useAuth();
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

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActivePage = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items for authenticated users
  const navItems = [
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
            
            {/* Logo - Hidden on /build route and prompt enhancer coming soon page */}
            {location.pathname !== '/build' && location.pathname !== '/prompt-enhancer-coming-soon' && (
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

          {/* Right side - Navigation and User actions */}
          <div className="flex items-center gap-2">
            
            {/* Always show Pricing CTA */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" onClick={() => handleNavigate('/pricing')}>
                Pricing
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
            
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              // Authenticated user - show XP badge
              <>
                {stats && (
                  <Badge variant="secondary" className="hidden sm:flex">
                    <Trophy className="w-3 h-3 mr-1" />
                    {stats.total_xp} XP
                  </Badge>
                )}
              </>
            ) : (
              // Non-authenticated user - show sign in
              <Button onClick={() => handleNavigate('/auth')} className="hidden md:flex">
                Sign In
              </Button>
            )}
            
            {/* Build button for authenticated users */}
            {user && (
              <Button onClick={() => handleNavigate('/build')} className="hidden md:flex">
                Build
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container py-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigate('/pricing')}
              >
                Pricing
              </Button>
              {!user ? (
                <Button
                  className="w-full"
                  onClick={() => handleNavigate('/auth')}
                >
                  Sign In
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleNavigate('/build')}
                >
                  Build
                </Button>
              )}
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