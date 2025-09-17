import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SettingsSidebar } from './SettingsSidebar';
import { AccountSection } from './sections/AccountSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { TeamSection } from './sections/TeamSection';
import { GeneralSection } from './sections/GeneralSection';
import { ShortcutsSection } from './sections/ShortcutsSection';
import { IntegrationsSection } from './sections/IntegrationsSection';
import { RepositorySection } from './sections/RepositorySection';
import { HelpSection } from './sections/HelpSection';
import { SubscriptionSection } from './sections/SubscriptionSection';
import { useNavigate } from 'react-router-dom';

export interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: string;
}

const sections = {
  account: { title: 'Account', description: 'Manage your personal information and security' },
  subscription: { title: 'Subscription', description: 'Manage your plan and billing' },
  general: { title: 'General', description: 'General application preferences' },
  appearance: { title: 'Appearance', description: 'Customize the interface appearance' },
  shortcuts: { title: 'Keyboard Shortcuts', description: 'View and customize shortcuts' },
  team: { title: 'Team', description: 'Manage your team members and invitations' },
  integrations: { title: 'Integrations', description: 'Connect your favorite tools and services' },
  repository: { title: 'Repository Mapping', description: 'Map your products to Git repositories and branches' },
  help: { title: 'Help', description: 'Documentation and support' },
};

export function SettingsModal({ open, onOpenChange, defaultSection = 'account' }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSection />;
      case 'subscription':
        return <SubscriptionSection />;
      case 'general':
        return <GeneralSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'shortcuts':
        return <ShortcutsSection />;
      case 'team':
        return <TeamSection />;
      case 'integrations':
        return <IntegrationsSection />;
      case 'repository':
        return <RepositorySection />;
      case 'help':
        return <HelpSection />;
      default:
        return <AccountSection />;
    }
  };

  const currentSection = sections[activeSection as keyof typeof sections];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-full min-h-[600px] max-h-[calc(90vh-2rem)]">
          {/* Sidebar */}
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border">
              <h1 className="text-2xl font-semibold text-foreground">
                {currentSection?.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSection?.description}
              </p>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}