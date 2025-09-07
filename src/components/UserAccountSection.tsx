import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, Keyboard, Trophy, LogOut, Sparkles, Moon, Sun, Lock, Crown, Bell, Users, UserPlus, HelpCircle, Plug } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { hasPromptEnhancerAccess } from '@/utils/accessControl';
import { AdminUserIdDisplay } from '@/components/AdminUserIdDisplay';
export function UserAccountSection() {
  const { user, signOut } = useAuth();
  const { stats } = useGamification();
  const { 
    theme, 
    setTheme, 
    resolvedTheme, 
    isDarkModeUnlocked,
    xpNeededForDarkMode,
    currentLevel,
    requiredLevel 
  } = useTheme();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const isCollapsed = state === 'collapsed';

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email: string) => {
    return email.split('@')[0];
  };
  if (isCollapsed) {
    return <div className="p-2 flex justify-start">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-background border-border z-50" align="end" side="right">
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
            
            <DropdownMenuItem onClick={() => {
              const destination = hasPromptEnhancerAccess(user?.id) 
                ? '/prompt-enhancer' 
                : '/prompt-enhancer-coming-soon';
              navigate(destination);
            }}>
              <Sparkles className="mr-2 h-4 w-4" />
              <div className="flex items-center gap-2">
                <span>Prompt Enhancer</span>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>;
  }
  return <div className="border-t pt-2 px-2 -mt-2">
      {/* XP Badge */}
      {stats && <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm mb-3">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{stats.total_xp} XP</span>
          <Badge variant="outline" className="text-xs">
            Lvl {stats.current_level}
          </Badge>
        </div>}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start px-2 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {user?.email ? getUserInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name || (user?.email ? getUserDisplayName(user.email) : 'User')}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64 p-2 bg-popover border-border z-[60]" 
          align="end" 
          side="right" 
          sideOffset={8}
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 p-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email ? getUserInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.user_metadata?.full_name || (user?.email ? getUserDisplayName(user.email) : 'User')}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                {stats && (
                  <div className="flex items-center gap-1">
                    <Crown className="h-3 w-3 text-accent" />
                    <span className="text-xs text-accent font-medium">
                      {stats.total_xp} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin User ID Display - Only show for debugging */}
          <AdminUserIdDisplay />

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            {stats && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Lvl {stats.current_level}
              </Badge>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/integrations')}>
            <Plug className="mr-2 h-4 w-4" />
            <span>Integrations</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowShortcuts(true)}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/achievements')}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Achievements</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => {
            const destination = hasPromptEnhancerAccess(user?.id) 
              ? '/prompt-enhancer' 
              : '/prompt-enhancer-coming-soon';
            navigate(destination);
          }}>
            <Sparkles className="mr-2 h-4 w-4" />
            <div className="flex items-center gap-2">
              <span>Prompt Enhancer</span>
              <Badge variant="secondary" className="text-xs">Soon</Badge>
            </div>
          </DropdownMenuItem>

          {/* Theme Switch */}
          <div className="flex items-center justify-between py-2 px-2 mt-2">
            <div className="flex items-center gap-3">
              {resolvedTheme === 'dark' ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="text-sm">Dark Mode</span>
                {!isDarkModeUnlocked && (
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Level {requiredLevel} required
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Switch 
              checked={resolvedTheme === 'dark'}
              disabled={!isDarkModeUnlocked}
              onCheckedChange={(checked) => {
                if (isDarkModeUnlocked) {
                  setTheme(checked ? 'dark' : 'light');
                }
              }}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={signOut}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal 
          open={showShortcuts} 
          onOpenChange={(open) => setShowShortcuts(open)} 
        />
      )}
    </div>;
}