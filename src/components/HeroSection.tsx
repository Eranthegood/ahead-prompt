import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroBackground from "@/assets/hero-background.jpg";

// Logo components
const CursorLogo = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L13.09 8.26L19 7L13.09 8.26L12 2Z" fill="currentColor" />
    <path d="M12 2L10.91 8.26L5 7L10.91 8.26L12 2Z" fill="currentColor" />
    <path d="M12 22L13.09 15.74L19 17L13.09 15.74L12 22Z" fill="currentColor" />
    <path d="M12 22L10.91 15.74L5 17L10.91 15.74L12 22Z" fill="currentColor" />
    <path d="M2 12L8.26 10.91L7 5L8.26 10.91L2 12Z" fill="currentColor" />
    <path d="M2 12L8.26 13.09L7 19L8.26 13.09L2 12Z" fill="currentColor" />
    <path d="M22 12L15.74 10.91L17 5L15.74 10.91L22 12Z" fill="currentColor" />
    <path d="M22 12L15.74 13.09L17 19L15.74 13.09L22 12Z" fill="currentColor" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const ClaudeLogo = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export default function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate('/build');
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Turn Code Ideas
            <br />
            Into Ready Prompts
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Capture exceptional prompts that blend clarity, context, and great 
            structure to make every AI interaction productive.
          </p>
          
          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-4 text-lg font-medium bg-white text-black hover:bg-white/90 transition-all duration-200 group"
            >
              {user ? "Start Building" : "Start Building Free"}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg">
            Smart organization, verified prompts, no chaos,<br />
            just clarity, efficiency, and productive AI conversations
          </p>
          
          {/* Integration Logos */}
          <div className="flex items-center justify-center gap-8 opacity-70">
            <div className="flex items-center gap-2">
              <CursorLogo className="h-6 w-6 text-white" />
              <span className="text-sm text-white/80">Cursor</span>
            </div>
            <div className="flex items-center gap-2">
              <ClaudeLogo className="h-6 w-6 text-white" />
              <span className="text-sm text-white/80">Claude</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-6 w-6 text-white" />
              <span className="text-sm text-white/80">GitHub</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}