import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessedLovableLogo } from './ProcessedLovableLogo';

// Logo components as SVGs for scalability
const LovableLogo = ({ className }: { className?: string }) => (
  <ProcessedLovableLogo 
    originalSrc="/lovable-uploads/62d647f9-b070-4b25-b438-cdcc2582220a.png"
    className={className}
  />
);

const CursorLogo = ({ className }: { className?: string }) => (
  <img 
    src="/lovable-uploads/b369a7a5-a645-450e-adb5-c24e9a3bb925.png" 
    alt="Cursor Logo" 
    className={className}
  />
);

const BoltLogo = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const GitHubLogo = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.55C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.665 3.735 16.65C4.68 16.635 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" fill="currentColor" />
  </svg>
);

const FigmaLogo = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="#0ACF83"/>
    <path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="#A259FF"/>
    <path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="#F24E1E"/>
    <path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="#FF7262"/>
    <path d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z" fill="#1ABCFE"/>
  </svg>
);

interface IntegrationItem {
  name: string;
  logo: React.ComponentType<{ className?: string }>;
  path: string;
  description: string;
}

const integrations: IntegrationItem[] = [
  {
    name: 'Lovable',
    logo: LovableLogo,
    path: '/integrations/lovable',
    description: 'AI-powered development platform'
  },
  {
    name: 'Cursor',
    logo: CursorLogo,
    path: '/integrations/cursor',
    description: 'AI code editor'
  },
  {
    name: 'Bolt',
    logo: BoltLogo,
    path: '/integrations/bolt',
    description: 'Fast development framework'
  },
  {
    name: 'GitHub',
    logo: GitHubLogo,
    path: '/integrations/github',
    description: 'Version control and collaboration'
  },
  {
    name: 'Figma',
    logo: FigmaLogo,
    path: '/integrations/figma',
    description: 'Design collaboration platform'
  }
];

export const IntegrationBanner: React.FC = () => {
  const navigate = useNavigate();

  const handleIntegrationClick = (path: string, name: string) => {
    // Analytics tracking could be added here
    console.log(`Clicked on ${name} integration`);
    navigate(path);
  };

  return (
    <div className="w-full bg-gradient-to-r from-background/50 via-background to-background/50 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground/90 mb-2">
            Seamlessly Integrated With Your Favorite Tools
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Connect your workflow with powerful integrations
          </p>
        </div>
        
        <div className="grid grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-2xl mx-auto">
          {integrations.map((integration) => {
            const LogoComponent = integration.logo;
            return (
              <button
                key={integration.name}
                onClick={() => handleIntegrationClick(integration.path, integration.name)}
                className="group flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all duration-300 hover:bg-accent/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-accent/50"
                title={integration.description}
              >
                <div className="relative">
                  <LogoComponent className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300 text-center">
                  {integration.name}
                </span>
              </button>
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default IntegrationBanner;