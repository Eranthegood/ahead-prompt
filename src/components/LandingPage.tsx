import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Zap, Code, Layers, ToggleLeft, Clipboard, Circle } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import chessKnightLogo from "@/assets/chess-knight-logo.png";
export default function LandingPage() {
  const {
    signInWithGoogle
  } = useAuth();
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

  return <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={chessKnightLogo} 
              alt="Ahead Logo" 
              className="w-10 h-10"
            />
            <div className="font-mono text-xl font-bold text-primary">
              Ahead
            </div>
          </div>
          <Button variant="ghost" onClick={handleGetStarted} className="text-sm hover:text-primary">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <BlurFade delay={0.25} inView>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              AHEAD
            </h1>
          </BlurFade>
          
          <BlurFade delay={0.5} inView>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Stay 3 moves ahead while AI generates your code
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The workspace developers love for capturing ideas during AI wait time.
            </p>
          </BlurFade>

          <BlurFade delay={0.75} inView>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleGetStarted} className="px-8 py-6 text-lg font-medium group">
                Get Ahead - Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </BlurFade>
        </div>
      </main>

      {/* Solution Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <BlurFade delay={0.8} inView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Turn Wait Time Into Win Time
            </h2>
          </BlurFade>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <BlurFade delay={0.9} inView>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm text-primary font-medium">STEP 1</div>
                <h3 className="font-semibold">Launch prompt in Cursor/Claude</h3>
              </div>
            </BlurFade>
            
            <BlurFade delay={1} inView>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <ToggleLeft className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm text-primary font-medium">STEP 2</div>
                <h3 className="font-semibold">Switch to Ahead</h3>
              </div>
            </BlurFade>
            
            <BlurFade delay={1.1} inView>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="flex space-x-1">
                    <Circle className="w-2 h-2 text-primary fill-current" />
                    <Circle className="w-2 h-2 text-primary fill-current" />
                    <Circle className="w-2 h-2 text-primary fill-current" />
                  </div>
                </div>
                <div className="text-sm text-primary font-medium">STEP 3</div>
                <h3 className="font-semibold">Prepare your next 3 moves</h3>
              </div>
            </BlurFade>
            
            <BlurFade delay={1.2} inView>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Clipboard className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm text-primary font-medium">STEP 4</div>
                <h3 className="font-semibold">Copy-paste instantly</h3>
              </div>
            </BlurFade>
          </div>
          
          <BlurFade delay={1.3} inView>
            <div className="bg-muted/50 rounded-2xl p-8 text-center">
              <div className="text-muted-foreground mb-2">GIF Demo Placeholder</div>
              <div className="text-sm text-muted-foreground">30 second demo coming soon</div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <BlurFade delay={1.4} inView>
            <blockquote className="text-xl md:text-2xl font-medium text-center mb-4 italic">
              "I was always 2-3 moves ahead. Completely crazy building speed."
            </blockquote>
            <cite className="text-center block mb-12 text-muted-foreground">
              - Jeremy, Indie Hacker
            </cite>
          </BlurFade>
          
          <BlurFade delay={1.5} inView>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Never lose creative momentum</h3>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Transform AI wait time into strategic advantage</h3>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Stay 3 moves ahead, always</h3>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Testimonials Section */}
      <section aria-labelledby="testimonials-heading" className="py-16 bg-background/50">
        <h3 id="testimonials-heading" className="sr-only">Testimonials</h3>
        <BlurFade delay={1} inView>
          <div className="max-w-5xl mx-auto px-6">
            <TestimonialSlider testimonials={testimonials} />
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          
        </div>
      </footer>
    </div>;
}