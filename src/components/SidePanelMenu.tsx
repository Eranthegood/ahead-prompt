import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Keyboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function SidePanelMenu() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Keyboard Shortcuts',
      icon: Keyboard,
      onClick: () => navigate('/shortcuts'),
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      variant: 'ghost' as const,
      className: 'text-destructive hover:text-destructive hover:bg-destructive/10',
    },
  ];

  return (
    <div className="mt-auto border-t border-border pt-4">
      <Separator className="mb-4" />
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={item.variant || 'ghost'}
            size="sm"
            className={`w-full justify-start text-sm font-normal ${item.className || ''}`}
            onClick={item.onClick}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}