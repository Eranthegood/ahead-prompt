import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Code, Layers, ToggleLeft, Clipboard, Circle, Github, Twitter, Mail } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import { Footer } from "@/components/ui/footer";
import chessKnightLogo from "@/assets/chess-knight-logo.png";
// Logo components
const CursorLogo = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L13.09 8.26L19 7L13.09 8.26L12 2Z" fill="currentColor"/>
    <path d="M12 2L10.91 8.26L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
    <path d="M12 22L13.09 15.74L19 17L13.09 15.74L12 22Z" fill="currentColor"/>
    <path d="M12 22L10.91 15.74L5 17L10.91 15.74L12 22Z" fill="currentColor"/>
    <path d="M2 12L8.26 10.91L7 5L8.26 10.91L2 12Z" fill="currentColor"/>
    <path d="M2 12L8.26 13.09L7 19L8.26 13.09L2 12Z" fill="currentColor"/>
    <path d="M22 12L15.74 10.91L17 5L15.74 10.91L22 12Z" fill="currentColor"/>
    <path d="M22 12L15.74 13.09L17 19L15.74 13.09L22 12Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>
);

const GitHubLogo = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.55C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.665 3.735 16.65C4.68 16.635 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" fill="currentColor"/>
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/build');
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
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 pb-16 sm:pb-20 pt-12 sm:pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <BlurFade delay={0.25} inView>
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Stay <span className="text-primary">3 moves ahead</span>
                <br />
                while AI generates your code
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
                Queue your next prompts while AI works
              </p>
            </div>
          </BlurFade>
          
          <BlurFade delay={0.75} inView>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button size="lg" onClick={handleSignIn} className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group w-full sm:w-auto">
                Get Ahead - Free
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </BlurFade>

          <BlurFade delay={0.9} inView>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 opacity-60">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>Integration with</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <CursorLogo className="h-5 w-5 sm:h-6 sm:w-6 opacity-70 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                    Cursor
                  </span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <GitHubLogo className="h-5 w-5 sm:h-6 sm:w-6 opacity-70 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                    GitHub
                  </span>
                </div>
              </div>
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
                    Start Free Demo
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

      {/* Stay 3 Moves Ahead Feature Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <BlurFade delay={0.5} inView>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  STAY 3 MOVES AHEAD
                </h2>
                
                <h3 className="text-xl font-semibold text-primary">
                  Turn AI Wait Time Into Strategic Advantage
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">The Problem</h4>
                    <p className="text-muted-foreground">
                      While your AI generates code (2-4 minutes), your brain is already racing with the next 3-4 ideas - bug fixes, optimizations, new features. But by the time the AI finishes, those brilliant ideas are forgotten, your creative flow is broken, and you're back to reactive coding.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">The Solution</h4>
                    <p className="text-muted-foreground">
                      Ahead lets you capture and queue your next moves instantly while AI works. Instead of waiting passively, you're always preparing the next prompt, the next improvement, the next breakthrough. Transform downtime into planning time.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">What You Get:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Lightning Capture</strong> - Queue 5 tasks in under 30 seconds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Maintained Flow</strong> - Never lose creative momentum during AI wait times</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Strategic Thinking</strong> - Plan your next 3-4 moves while current one executes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span><strong>Instant Deployment</strong> - Copy-paste queued prompts the moment AI is ready</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Example:</h4>
                    <p className="text-sm text-muted-foreground italic">
                      You send a login component to Claude. Instead of scrolling Twitter, you queue: "Add error handling", "Create responsive design", "Write unit tests", "Add loading states". When Claude finishes, boom - your next prompt is ready to go.
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <p className="font-semibold text-primary">
                      The Result: You build faster because you think faster. Turn reactive development into strategic execution.
                    </p>
                  </div>
                  
                  <Button size="lg" onClick={handleSignIn} className="mt-6 px-8 py-6 text-lg font-medium group">
                    Stay 3 Moves Ahead - Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </BlurFade>
            
            <BlurFade delay={0.7} inView>
              <div className="relative h-[600px] w-full bg-muted/30 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/a8aec4c7-12f7-4831-9e35-c7dafdc9f43d.png" 
                  alt="Ahead.love interface showing queued prompts and tasks, demonstrating how to stay 3 moves ahead while AI generates code"
                  className="w-full h-full object-contain"
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
              <div className="relative h-[600px] w-full bg-muted/30 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/55ae261f-bec5-4f29-bb84-cd997afc58ec.png" 
                  alt="Smart Prompt Generation interface showing AI-powered prompt editing with rich formatting and context-aware generation"
                  className="w-full h-full object-contain"
                />
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<img src={chessKnightLogo} alt="Ahead Logo" className="w-8 h-8" />}
        brandName="Ahead"
        socialLinks={[
          {
            icon: <Github className="h-4 w-4" />,
            href: "https://github.com/ahead-love",
            label: "GitHub"
          },
          {
            icon: <Twitter className="h-4 w-4" />,
            href: "https://twitter.com/ahead_love",
            label: "Twitter"
          },
          {
            icon: <Mail className="h-4 w-4" />,
            href: "mailto:hello@ahead.love",
            label: "Email"
          }
        ]}
        mainLinks={[
          { href: "/", label: "Home" },
          { href: "/build", label: "Dashboard" },
          { href: "/features", label: "Features" },
          { href: "/pricing", label: "Pricing" }
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
          { href: "/cookies", label: "Cookie Policy" }
        ]}
        copyright={{
          text: "© 2024 Ahead. All rights reserved.",
          license: "Built with ❤️ for developers who stay ahead."
        }}
      />
    </div>;
}