import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  User, 
  Settings, 
  Palette, 
  Keyboard, 
  Users, 
  Mail, 
  Plug, 
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const menuSections = [
  {
    title: 'Settings',
    items: [
      { id: 'account', label: 'Account', icon: User },
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
      { id: 'general', label: 'General', icon: Settings },
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
    ],
  },
  {
    title: 'Collaboration',
    items: [
      { id: 'team', label: 'Team', icon: Users },
      { id: 'integrations', label: 'Integrations', icon: Plug },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', label: 'Help', icon: HelpCircle },
    ],
  },
];

export function SettingsSidebar({ 
  activeSection, 
  onSectionChange, 
  searchTerm, 
  onSearchChange 
}: SettingsSidebarProps) {
  // Filter items based on search term
  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  return (
    <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title} className="px-3 py-2">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "w-full justify-start px-3 py-2 h-auto font-normal",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
            {sectionIndex < filteredSections.length - 1 && (
              <Separator className="my-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}