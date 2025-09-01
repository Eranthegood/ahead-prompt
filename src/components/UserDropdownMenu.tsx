import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  KeyboardIcon, 
  LogOut, 
  Crown,
  Bell,
  Palette,
  Users,
  UserPlus,
  HelpCircle,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useTheme } from '@/hooks/useTheme';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

export function UserDropdownMenu() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { stats } = useGamification();
  const { theme, setTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email: string) => {
    return email.split('@')[0];
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profil',
      shortcut: '⌘P',
      onClick: () => navigate('/profile'),
      badge: stats ? `Niveau ${stats.current_level}` : null,
      badgeVariant: 'secondary' as const
    },
    {
      icon: Settings,
      label: 'Paramètres',
      shortcut: '⌘,',
      onClick: () => navigate('/settings'),
      badge: null
    },
    {
      icon: Bell,
      label: 'Notifications',
      shortcut: '⌘N',
      onClick: () => {},
      badge: '3',
      badgeVariant: 'destructive' as const
    },
    {
      icon: KeyboardIcon,
      label: 'Raccourcis clavier',
      shortcut: '?',
      onClick: () => setShowShortcuts(true),
      badge: null
    }
  ];

  const bottomItems = [
    {
      icon: Users,
      label: 'Équipe',
      onClick: () => {},
      badge: 'Bientôt',
      badgeVariant: 'outline' as const
    },
    {
      icon: UserPlus,
      label: 'Inviter des utilisateurs',
      onClick: () => {},
      badge: '+100 XP',
      badgeVariant: 'secondary' as const
    },
    {
      icon: HelpCircle,
      label: 'Aide & support',
      onClick: () => {},
      badge: '2',
      badgeVariant: 'secondary' as const
    }
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 px-2 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {user?.email ? getUserInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-64 p-2 bg-popover/95 backdrop-blur-sm border-border" 
          align="end"
          sideOffset={8}
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 p-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email ? getUserInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email ? getUserDisplayName(user.email) : 'Utilisateur'}
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

          <DropdownMenuSeparator />

          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <DropdownMenuItem 
              key={item.label}
              onClick={item.onClick}
              className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-muted/50 rounded-md"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge variant={item.badgeVariant || 'secondary'} className="text-xs px-1.5 py-0.5">
                    {item.badge}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{item.shortcut}</span>
              </div>
            </DropdownMenuItem>
          ))}

          {/* Theme Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-3 py-2 px-2 cursor-pointer hover:bg-muted/50 rounded-md">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Apparence</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48 bg-popover/95 backdrop-blur-sm">
              <DropdownMenuItem 
                onClick={() => setTheme('light')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-background border border-border" />
                  <span>Clair</span>
                  {theme === 'light' && <Badge variant="outline" className="ml-auto text-xs">Actuel</Badge>}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('dark')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-foreground" />
                  <span>Sombre</span>
                  {theme === 'dark' && <Badge variant="outline" className="ml-auto text-xs">Actuel</Badge>}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('system')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-background to-foreground" />
                  <span>Système</span>
                  {theme === 'system' && <Badge variant="outline" className="ml-auto text-xs">Actuel</Badge>}
                </div>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Bottom Items */}
          {bottomItems.map((item) => (
            <DropdownMenuItem 
              key={item.label}
              onClick={item.onClick}
              className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-muted/50 rounded-md"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <Badge variant={item.badgeVariant} className="text-xs px-1.5 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-destructive/10 hover:text-destructive rounded-md text-destructive"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Se déconnecter</span>
            </div>
            <span className="text-xs text-muted-foreground">⌘⇧Q</span>
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
    </>
  );
}