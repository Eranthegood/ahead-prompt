import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SettingsSidebar } from './SettingsSidebar';
import { AccountSection } from './sections/AccountSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { TeamSection } from './sections/TeamSection';
import { FavoriteLinksSection } from './sections/FavoriteLinksSection';
import { GeneralSection } from './sections/GeneralSection';
import { ShortcutsSection } from './sections/ShortcutsSection';
import { IntegrationsSection } from './sections/IntegrationsSection';
import { HelpSection } from './sections/HelpSection';
import { SubscriptionSection } from './sections/SubscriptionSection';

export interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: string;
}

const sections = {
  account: { title: 'Compte', description: 'Gérez vos informations personnelles et votre sécurité' },
  subscription: { title: 'Abonnement', description: 'Gérez votre plan et facturation' },
  general: { title: 'Général', description: 'Préférences générales de l\'application' },
  appearance: { title: 'Apparence', description: 'Personnalisez l\'apparence de l\'interface' },
  shortcuts: { title: 'Raccourcis clavier', description: 'Consultez et personnalisez les raccourcis' },
  favoriteLinks: { title: 'Liens Favoris', description: 'Gérez vos liens et ressources favorites' },
  team: { title: 'Équipe', description: 'Gérez les membres et invitations de votre équipe' },
  integrations: { title: 'Intégrations', description: 'Connectez vos outils et services préférés' },
  help: { title: 'Aide', description: 'Documentation et support' },
};

export function SettingsModal({ open, onOpenChange, defaultSection = 'account' }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [searchTerm, setSearchTerm] = useState('');

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
      case 'favoriteLinks':
        return <FavoriteLinksSection />;
      case 'team':
        return <TeamSection />;
      case 'integrations':
        return <IntegrationsSection />;
      case 'help':
        return <HelpSection />;
      default:
        return <AccountSection />;
    }
  };

  const currentSection = sections[activeSection as keyof typeof sections];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full min-h-[600px]">
          {/* Sidebar */}
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
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