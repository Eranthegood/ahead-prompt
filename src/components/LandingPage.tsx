import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Zap, Code, Layers, ToggleLeft, Clipboard, Circle } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import chessKnightLogo from "@/assets/chess-knight-logo.png";

export default function LandingPage() {
  const { signInWithGoogle } = useAuth();
  
  const handleGetStarted = async () => {
    await signInWithGoogle();
  };

  const testimonials = [
    {
      img: "https://randomuser.me/api/portraits/women/65.jpg",
      quote: "After struggling with prompt chaos for months (copy-pasting from random docs, losing track of versions), I needed something that actually fits my workflow.",
      name: "Sarah",
      role: "Full-Stack Developer",
    },
    {
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "My prompt collection has gone from fun experiments to... a monster living in Google Docs, stickies, chat logs. I spend more time hunting prompts than coding.",
      name: "Mike",
      role: "Indie Hacker",
    },
    {
      img: "https://randomuser.me/api/portraits/men/78.jpg",
      quote: "J'avais toujours 2-3 coups d'avance. Vitesse de construction complètement folle.",
      name: "Jeremy",
      role: "Indie Hacker",
    },
    {
      img: "https://randomuser.me/api/portraits/men/54.jpg",
      quote: "Now I capture every brilliant idea the moment it hits. No more 'wait, what was that fix I thought of?' moments. My development flow is finally uninterrupted.",
      name: "Alex",
      role: "Late night SaaS builder",
    },
    {
      img: "https://randomuser.me/api/portraits/women/88.jpg",
      quote: "I went from frantically switching between 12 tabs to having my next 3 moves ready before Cursor even finishes. Game changer for shipping fast.",
      name: "Sarah",
      role: "Full-Stack Developer",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-mini-coral rounded-2xl flex items-center justify-center shadow-lg">
              <img 
                src={chessKnightLogo} 
                alt="Ahead Logo" 
                className="w-8 h-8"
              />
            </div>
            <div className="font-bold text-2xl text-foreground tracking-tight">
              Ahead
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleGetStarted} 
            className="text-sm hover:bg-mini-mint/20 rounded-full px-6"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background organic shapes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-mini-mint/30 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-mini-coral/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-mini-yellow/25 rounded-full blur-xl"></div>
          <div className="absolute top-60 right-1/3 w-24 h-24 bg-mini-purple/30 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 right-10 w-36 h-36 bg-mini-blue/25 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <BlurFade delay={0.25} inView>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 text-foreground">
              AHEAD
            </h1>
          </BlurFade>
          
          <BlurFade delay={0.5} inView>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground/80">
              Stay 3 moves ahead while AI generates your code
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
              The workspace developers love for capturing ideas during AI wait time.
            </p>
          </BlurFade>

          <BlurFade delay={0.75} inView>
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              className="px-12 py-8 text-xl font-semibold rounded-2xl bg-mini-coral hover:bg-mini-coral/90 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              Get Ahead - Free
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
          </BlurFade>
        </div>
      </main>

      {/* How it works Section */}
      <section className="py-32 px-6 relative">
        {/* Background organic shapes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 w-28 h-28 bg-mini-blue/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-mini-mint/25 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <BlurFade delay={0.8} inView>
            <h2 className="text-5xl md:text-6xl font-black text-center mb-20 text-foreground tracking-tight">
              Turn Wait Time Into Win Time
            </h2>
          </BlurFade>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <BlurFade delay={0.9} inView>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-mini-coral/20 rounded-3xl flex items-center justify-center shadow-lg">
                  <Code className="w-10 h-10 text-mini-coral" />
                </div>
                <div className="text-xs font-bold text-mini-coral uppercase tracking-wider bg-mini-coral/10 px-3 py-1 rounded-full inline-block">
                  STEP 1
                </div>
                <h3 className="font-bold text-lg">Launch prompt in Cursor/Claude</h3>
              </div>
            </BlurFade>
            
            <BlurFade delay={1} inView>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-mini-mint/20 rounded-3xl flex items-center justify-center shadow-lg">
                  <ToggleLeft className="w-10 h-10 text-mini-mint" />
                </div>
                <div className="text-xs font-bold text-mini-mint uppercase tracking-wider bg-mini-mint/10 px-3 py-1 rounded-full inline-block">
                  STEP 2
                </div>
                <h3 className="font-bold text-lg">Switch to Ahead</h3>
              </div>
            </BlurFade>
            
            <BlurFade delay={1.1} inView>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-mini-yellow/20 rounded-3xl flex items-center justify-center shadow-lg">
                  <div className="flex space-x-1">
                    <Circle className="w-3 h-3 text-mini-yellow fill-current" />
                    <Circle className="w-3 h-3 text-mini-yellow fill-current" />
                    <Circle className="w-3 h-3 text-mini-yellow fill-current" />
                  </div>
                </div>
                <div className="text-xs font-bold text-mini-yellow uppercase tracking-wider bg-mini-yellow/10 px-3 py-1 rounded-full inline-block">
                  STEP 3
                </div>
                <h3 className="font-bold text-lg">Prepare your next 3 moves</h3>
              </div>
            </BlurFade>
            
            <BlurFade delay={1.2} inView>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-mini-purple/20 rounded-3xl flex items-center justify-center shadow-lg">
                  <Clipboard className="w-10 h-10 text-mini-purple" />
                </div>
                <div className="text-xs font-bold text-mini-purple uppercase tracking-wider bg-mini-purple/10 px-3 py-1 rounded-full inline-block">
                  STEP 4
                </div>
                <h3 className="font-bold text-lg">Copy-paste instantly</h3>
              </div>
            </BlurFade>
          </div>
          
          <BlurFade delay={1.3} inView>
            <div className="bg-card rounded-3xl p-16 text-center shadow-xl border border-border/50">
              <div className="w-16 h-16 bg-mini-blue/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-8 h-8 text-mini-blue" />
              </div>
              <div className="text-2xl font-bold text-card-foreground mb-4">GIF Demo Coming Soon</div>
              <div className="text-muted-foreground">30 second demo of the complete workflow</div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-muted/30"></div>
        
        <div className="max-w-4xl mx-auto">
          <BlurFade delay={1.4} inView>
            <blockquote className="text-3xl md:text-4xl font-bold text-center mb-8 italic text-foreground">
              "I was always 2-3 moves ahead. Completely crazy building speed."
            </blockquote>
            <cite className="text-center block mb-20 text-muted-foreground text-lg">
              - Jeremy, Indie Hacker
            </cite>
          </BlurFade>
          
          <BlurFade delay={1.5} inView>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-mini-coral/20 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-mini-coral" />
                </div>
                <h3 className="font-bold text-xl">Never lose creative momentum</h3>
              </div>
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-mini-mint/20 rounded-2xl flex items-center justify-center mb-6">
                  <ArrowRight className="w-8 h-8 text-mini-mint" />
                </div>
                <h3 className="font-bold text-xl">Transform AI wait time into strategic advantage</h3>
              </div>
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-mini-yellow/20 rounded-2xl flex items-center justify-center mb-6">
                  <Layers className="w-8 h-8 text-mini-yellow" />
                </div>
                <h3 className="font-bold text-xl">Stay 3 moves ahead, always</h3>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Testimonials Section */}
      <section aria-labelledby="testimonials-heading" className="py-32 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-40 h-40 bg-mini-purple/15 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-mini-coral/10 rounded-full blur-2xl"></div>
        </div>
        
        <h3 id="testimonials-heading" className="sr-only">Testimonials</h3>
        <BlurFade delay={1} inView>
          <div className="max-w-5xl mx-auto px-6">
            <TestimonialSlider testimonials={testimonials} />
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-10 h-10 bg-mini-coral rounded-xl flex items-center justify-center">
              <img 
                src={chessKnightLogo} 
                alt="Ahead Logo" 
                className="w-6 h-6"
              />
            </div>
            <div className="font-bold text-lg text-foreground">
              Ahead
            </div>
          </div>
          <p className="text-muted-foreground">
            The workspace developers love for capturing ideas during AI wait time.
          </p>
        </div>
      </footer>
    </div>
  );
}