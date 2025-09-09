import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Zap, Code, Layers, ToggleLeft, Clipboard, Circle, Github, Twitter, Mail } from "lucide-react";
import { IntegrationBanner } from "@/components/IntegrationBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import HeroSection from "@/components/HeroSection";
import { lazy, Suspense, useState, useEffect } from "react";

const InteractivePromptCardsLazy = lazy(() => import("@/components/InteractivePromptCards").then(m => ({ default: m.InteractivePromptCards })));
const CollaborativeRepoAnimationLazy = lazy(() => import("@/components/CollaborativeRepoAnimation"));

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [supademoLoaded, setSupademoLoaded] = useState(false);
  
  // Check if Supademo script is loaded
  useEffect(() => {
    const checkSupademo = () => {
      if (typeof window !== 'undefined' && document.querySelector('script[src*="supademo"]')) {
        setSupademoLoaded(true);
      }
    };
    
    checkSupademo();
    // Recheck after a delay in case script loads later
    const timer = setTimeout(checkSupademo, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleSignIn = () => {
    navigate('/build');
  };
  const testimonials = [{
    img: "https://randomuser.me/api/portraits/women/65.jpg",
    quote: "After struggling with prompt chaos for months (copy-pasting from random docs, losing track of versions), I needed something that actually fits my workflow.",
    name: "Sarah",
    role: "Full-Stack Developer"
  }, {
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "My prompt collection has gone from fun experiments to... a monster living in Google Docs, stickies, chat logs. I spend more time hunting prompts than coding.",
    name: "Mike",
    role: "Indie Hacker"
  }, {
    img: "https://randomuser.me/api/portraits/men/54.jpg",
    quote: "Now I capture every brilliant idea the moment it hits. No more 'wait, what was that fix I thought of?' moments. My development flow is finally uninterrupted.",
    name: "Alex",
    role: "Late night SaaS builder"
  }, {
    img: "https://randomuser.me/api/portraits/women/88.jpg",
    quote: "I went from frantically switching between 12 tabs to having my next 3 moves ready before Cursor even finishes. Game changer for shipping fast.",
    name: "Sarah",
    role: "Full-Stack Developer"
  }];
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Stay 3 Moves Ahead Feature Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Tired of 5 open tabs and half-written Notion blocks?
              </h2>
               
               <p className="text-xl text-muted-foreground">
                 Centralize the chaos. Your ready to develop prompts workspace that moves at brain speed.
               </p>
                
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-primary"></span>
                   <span><strong>Queue tasks in seconds</strong> - Never wait idle again</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-primary"></span>
                   <span><strong>Maintain creative flow</strong> - Zero momentum loss</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-primary"></span>
                   <span><strong>Always ready</strong> - Next prompt waits for you</span>
                 </div>
               </div>
                 
                 
               <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                 {user ? "Build" : "Try Free Now"}
                 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
               </Button>
             </div>
             
              <div className="flex items-center justify-center min-h-[600px]">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-[600px] w-full bg-muted/30 rounded-lg" />}>
                  <InteractivePromptCardsLazy />
                </Suspense>
              </ErrorBoundary>
              </div>
           </div>
         </div>
       </section>


      {/* Feature Demo Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Capture Ideas While AI Works
              </h2>
              
              <p className="text-muted-foreground text-lg">
                Don't lose brilliant ideas during AI wait times. Capture, organize, and queue your next moves instantly.
              </p>
                
              <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                {user ? "Build" : "Try it now"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {supademoLoaded ? (
              <div style={{
                position: 'relative',
                boxSizing: 'content-box',
                maxHeight: '80vh',
                width: '100%',
                aspectRatio: '2.1068032187271397',
                padding: '40px 0 40px 0'
              }}>
                <iframe 
                  src="https://app.supademo.com/embed/cmf22hezn02kh39oz59xqgr7y?embed_v=2&utm_source=embed" 
                  loading="lazy" 
                  title="Task creation demo" 
                  allow="clipboard-write" 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }} 
                  allowFullScreen 
                />
              </div>
            ) : (
              <div className="h-[400px] w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Loading demo...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prompt Enhancement & CLEAR Principle Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Professional Prompts.<br />
                <span className="text-primary">Ready for Any Platform.</span>
              </h2>
              
              <h3 className="text-xl font-semibold text-primary">
                CLEAR Principle Framework
              </h3>
               
              <p className="text-xl text-muted-foreground">Every idea is automatically enhanced using our CLEAR framework, delivering professional-quality results across Cursor, Claude, ChatGPT, and any AI platform.</p>
               
              <div className="space-y-4">
                <h4 className="font-semibold">The CLEAR Framework:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <div>
                      <strong>Clear</strong> - Unambiguous instructions and context
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <div>
                      <strong>Logical</strong> - Structured approach with clear reasoning
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <div>
                      <strong>Engaging</strong> - Compelling and contextual prompts
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <div>
                      <strong>Actionable</strong> - Specific, executable instructions
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <div>
                      <strong>Relevant</strong> - Targeted to your specific context
                    </div>
                  </div>
                </div>
              </div>
                
              <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                {user ? "Build" : "Enhance Your Prompts"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-2xl p-8 space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Universal Compatibility</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Code className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Cursor</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Claude</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Layers className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">ChatGPT</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <ToggleLeft className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Any AI</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clipboard className="h-5 w-5 text-primary" />
                    <span className="text-sm">One-click copy to any platform</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="h-5 w-5 text-primary" />
                    <span className="text-sm">Consistent results across AIs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-sm">Professional-quality outputs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section aria-labelledby="testimonials-heading" className="py-16 bg-background/50">
        <h3 id="testimonials-heading" className="sr-only">Testimonials</h3>
        <div className="max-w-5xl mx-auto px-6">
          <TestimonialSlider testimonials={testimonials} />
        </div>
      </section>

      {/* Cursor Multi-Agent Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="space-y-6 lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold">
                Queue Dozens of Prompts.<br />Run Them All at Once.
              </h2>
              
              <h3 className="text-xl font-semibold text-primary">
                Cursor Multi-Agent Integration
              </h3>
               
              <p className="text-xl text-muted-foreground">
                Stop waiting for AI one prompt at a time. Queue 10, 20, even 50 related prompts in Ahead, then push them all to Cursor Agent with one click.
              </p>
               
              <div className="space-y-4">
                <h4 className="font-semibold">The new workflow:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span><strong>Queue dozens of prompts</strong> while you think</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span><strong>One-click batch export</strong> to Cursor</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span><strong>Multiple AI agents</strong> work simultaneously</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span><strong>Ship features 4x faster</strong></span>
                  </div>
                </div>
              </div>
                
              <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                {user ? "Build" : "Try Multi-Agent Free"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Collaborative Animation */}
            <div className="flex justify-center items-center">
            <ErrorBoundary>
              <Suspense fallback={<div className="h-[500px] w-full bg-muted/30 rounded-lg" />}>
                <CollaborativeRepoAnimationLazy />
              </Suspense>
            </ErrorBoundary>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Banner */}
      <IntegrationBanner />


      {/* Footer */}
      <Footer logo={<Zap className="w-8 h-8 text-primary" />} brandName="Ahead" mainLinks={[{
      href: "/",
      label: "Home"
    }, {
      href: "/cursor-multi-agent",
      label: "Features"
    }, {
      href: "/build",
      label: "Dashboard"
    }, {
      href: "/pricing",
      label: "Pricing"
    }]} legalLinks={[{
      href: "/privacy",
      label: "Privacy Policy"
    }, {
      href: "/terms",
      label: "Terms of Service"
    }, {
      href: "/cookies",
      label: "Cookie Policy"
    }]} copyright={{
      text: "© 2024 Ahead. All rights reserved.",
      license: "Built with ❤️ for developers who stay ahead."
    }} />
    </div>;
}