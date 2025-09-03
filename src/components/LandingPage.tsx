import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Code, Layers, ToggleLeft, Clipboard, Circle } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import chessKnightLogo from "@/assets/chess-knight-logo.png";
export default function LandingPage() {
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth');
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
          <Button variant="ghost" onClick={handleSignIn} className="text-sm hover:text-primary">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20 pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <BlurFade delay={0.25} inView>
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Stay <span className="text-primary">3 moves ahead</span>
                <br />
                while AI generates your code
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The workspace developers love for capturing ideas during AI wait time.
              </p>
            </div>
          </BlurFade>
          
          <BlurFade delay={0.75} inView>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                Get Ahead - Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </BlurFade>

          <BlurFade delay={1.0} inView>
            <div className="flex justify-center mt-8">
              <a href="https://peerpush.net/p/ahead"
                target="_blank"
                rel="noopener"
                style={{height: '60px'}}
              >
                <img
                  src="https://peerpush.net/p/ahead/badge"
                  alt="Ahead badge"
                  style={{height: '60px'}}
                />
              </a>
            </div>
          </BlurFade>
        </div>
      </main>

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
            <div className="relative box-content max-h-[80vh] w-full py-10" style={{ aspectRatio: '2.0136' }}>
              <iframe 
                src="https://app.supademo.com/embed/cmf1njhj6adejv9kqczgddst5?embed_v=2&utm_source=embed" 
                loading="lazy" 
                title="Ahead Demo" 
                allow="clipboard-write" 
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0 rounded-lg"
              />
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

      {/* Feature Demo Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <BlurFade delay={0.5} inView>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Never Lose Your Next Brilliant Idea Again
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">PAIN POINT</h3>
                    <p className="text-muted-foreground">
                      You're coding with AI when inspiration strikes - a perfect fix, an elegant refactor, the next feature. 
                      But by the time Claude finishes generating, that brilliant idea is gone. Lost in the 2-4 minutes of waiting, 
                      buried under new problems, forgotten in the chaos of context switching.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">SOLUTION</h3>
                    <p className="text-muted-foreground mb-4">
                      Ahead captures your ideas the instant they happen. Create a task in seconds, let our AI generate the 
                      perfect prompt, then copy-paste to any tool when you're ready. Your creative flow stays intact, 
                      your momentum never breaks.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">How it works:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Quick Capture</strong> - Turn any idea into a structured task instantly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Smart Generation</strong> - AI creates optimized prompts using your project context</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>One-Click Deploy</strong> - Copy to Cursor, Claude, ChatGPT, or any AI tool</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Button size="lg" onClick={handleSignIn} className="mt-6 px-8 py-6 text-lg font-medium group">
                    Start Building Faster Today - Free Demo Available
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </BlurFade>
            
            <BlurFade delay={0.7} inView>
              <div className="relative box-content max-h-[80vh] w-full py-10" style={{ aspectRatio: '2.1068032187271397' }}>
                <iframe 
                  src="https://app.supademo.com/embed/cmf22hezn02kh39oz59xqgr7y?embed_v=2&utm_source=embed" 
                  loading="lazy" 
                  title="Task creation demo" 
                  allow="clipboard-write" 
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0 rounded-lg"
                />
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Smart Prompt Generation Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <BlurFade delay={0.5} inView>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  SMART PROMPT GENERATION
                </h2>
                
                <h3 className="text-xl font-semibold text-primary">
                  Stop Writing Prompts From Scratch Every Time
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">The Problem</h4>
                    <p className="text-muted-foreground">
                      You keep rewriting similar prompts, losing context between projects, and getting mediocre results 
                      because your AI doesn&apos;t understand your specific requirements, coding style, or project architecture.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">The Solution</h4>
                    <p className="text-muted-foreground">
                      Ahead&apos;s Smart Prompt Generation uses your project&apos;s knowledge base to create contextually-rich 
                      prompts that get better results. Upload your docs, design systems, and code standards once - every 
                      generated prompt includes the relevant context automatically.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">What You Get:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Context-Aware Prompts</strong> - Automatically includes relevant project documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Reusable Templates</strong> - Bug fixes, features, refactors pre-formatted for your tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Consistent Quality</strong> - Same high standards across all your prompts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Time Saved</strong> - No more copy-pasting context or rewriting similar requests</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Example:</h4>
                    <p className="text-sm text-muted-foreground italic">
                      Instead of manually explaining your React component structure every time, Smart Prompt pulls your 
                      style guide and generates: &quot;Using our established component patterns in /docs/components.md, create a 
                      new UserProfile component that follows our TypeScript interfaces...&quot;
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <p className="font-semibold text-primary">
                      The Result: Better AI responses in less time, with zero context switching.
                    </p>
                  </div>
                  
                  <Button size="lg" onClick={handleSignIn} className="mt-6 px-8 py-6 text-lg font-medium group">
                    Try Smart Prompts - Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </BlurFade>
            
            <BlurFade delay={0.7} inView>
              <div className="relative h-[400px] w-full bg-muted/30 rounded-lg flex items-center justify-center">
                {/* Placeholder for image */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Smart Prompt Demo</p>
                  <p className="text-sm text-muted-foreground">Image coming soon</p>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          
        </div>
      </footer>
    </div>;
}