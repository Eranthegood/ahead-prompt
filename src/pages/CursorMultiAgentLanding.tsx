import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Clock, CheckCircle, Users, Code, Layers, Rocket, Bug, Settings, Package, Timer, TrendingUp, Star, Github } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import chessKnightLogo from "@/assets/chess-knight-logo.png";
import { Footer } from "@/components/ui/footer";

// Cursor Logo Component
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

export default function CursorMultiAgentLanding() {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/build');
  };

  const testimonials = [
    {
      quote: "Went from shipping 1 feature per day to 4 features. The parallel processing is insane.",
      name: "Sarah",
      role: "Full-Stack Developer",
    },
    {
      quote: "Our team velocity increased 4x overnight. We queue prompts during standup and have working features by lunch.",
      name: "Marcus",
      role: "Startup CTO",
    },
    {
      quote: "Built my entire SaaS backend in one afternoon. Queued 47 prompts - all executed simultaneously. This is the future.",
      name: "Lisa",
      role: "Indie Hacker",
    },
    {
      quote: "Finally working WITH AI instead of waiting FOR AI.",
      name: "Alex",
      role: "Beta User",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 pb-16 sm:pb-20 pt-12 sm:pt-16 md:pt-24">
        <div className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-y-6">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2">
              Revolutionary Multi-Agent Technology
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-primary">Cursor Multi-Agent</span>
              <br />
              Integration
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              Queue 10, 20, even 50 prompts. Execute them all simultaneously.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button size="lg" onClick={handleGetStarted} className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group w-full sm:w-auto">
              Start Queuing Dozens of Prompts - Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            No credit card required. Full access during beta.
          </p>
        </div>
      </main>

      {/* Problem vs Solution Comparison */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Traditional AI Development */}
            <Card className="border-2 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Traditional AI Development
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-destructive"></span>
                    <span>Write prompt → Wait 4 minutes → Write next → Wait again</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-destructive"></span>
                    <span>Build features one component at a time</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-destructive"></span>
                    <span>Lose momentum during generation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-destructive"></span>
                    <span>Forget ideas while waiting</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ahead + Cursor Multi-Agent */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Ahead + Cursor Multi-Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Queue dozens of related prompts in minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>One-click batch export to Cursor Agent</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Multiple AI instances work in parallel</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Ship complete features in record time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real Example Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Example: E-commerce Dashboard
            </h2>
            <p className="text-muted-foreground text-lg">
              See the dramatic difference in development speed
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sequential Approach */}
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Sequential Approach (Old Way)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Product list component</span>
                    <Badge variant="destructive">4 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Search functionality</span>
                    <Badge variant="destructive">4 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Filters system</span>
                    <Badge variant="destructive">4 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pagination</span>
                    <Badge variant="destructive">3 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Loading states</span>
                    <Badge variant="destructive">3 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error handling</span>
                    <Badge variant="destructive">3 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unit tests</span>
                    <Badge variant="destructive">4 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Integration tests</span>
                    <Badge variant="destructive">4 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Documentation</span>
                    <Badge variant="destructive">3 min wait</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Responsive fixes</span>
                    <Badge variant="destructive">4 min wait</Badge>
                  </div>
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-destructive">
                    <span>Total:</span>
                    <span>36 minutes of waiting</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ahead Multi-Agent */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Ahead Multi-Agent (New Way)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Queue all 10 prompts</span>
                    <Badge className="bg-primary/20 text-primary">2 minutes</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Push batch to Cursor Agent</span>
                    <Badge className="bg-primary/20 text-primary">1 click</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>All components built in parallel</span>
                    <Badge className="bg-primary/20 text-primary">8 minutes</Badge>
                  </div>
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-primary">
                    <span>Total:</span>
                    <span>10 minutes end-to-end</span>
                  </div>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg mt-4">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span>Result: 3.6x faster delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Perfect For Every Development Scenario */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Perfect For Every Development Scenario
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">🚀 Complete Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>UI components + business logic + tests + documentation</p>
                <p className="font-medium">All built simultaneously, not sequentially</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Bug className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">🐛 Bug Fixing Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Related fixes + tests + edge cases + docs</p>
                <p className="font-medium">Handle entire bug categories in one batch</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">🔧 Large Refactoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Dozens of components updated in parallel</p>
                <p className="font-medium">Maintain consistency across your entire codebase</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">📦 API Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Endpoints + validation + tests + documentation</p>
                <p className="font-medium">Ship complete API modules, not individual routes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Developers Are Saying
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                    </div>
                    <div className="space-y-3">
                      <blockquote className="text-lg italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div>
                        <cite className="font-medium not-italic">– {testimonial.name}</cite>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Smart Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Projects → Epics → Individual prompts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Priority queuing with drag-and-drop</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Templates for common patterns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Knowledge base for rich context</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>2. Parallel Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Select multiple prompts with one click</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Intelligent batching by context</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Conflict detection and resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Real-time progress tracking</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>3. Seamless Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>One-click copy to any AI tool</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Direct Cursor Agent integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>GitHub branch management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Automatic commit messages</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Technical Specs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Cursor Agent API</p>
                    <p className="text-sm text-muted-foreground">Direct integration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">GitHub Integration</p>
                    <p className="text-sm text-muted-foreground">Branch management</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">100+ Prompt Batches</p>
                    <p className="text-sm text-muted-foreground">No limits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">10x Parallel Processing</p>
                    <p className="text-sm text-muted-foreground">Multiple AI agents</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">94% Success Rate</p>
                    <p className="text-sm text-muted-foreground">Reliable coordination</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">4x Speed Improvement</p>
                    <p className="text-sm text-muted-foreground">Proven results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Requirements: Cursor Pro subscription, GitHub access
            </p>
          </div>
        </div>
      </section>

      {/* Get Started Steps */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Get Started in 60 Seconds
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Sign up free → ahead.love</h3>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Connect Cursor → One-click OAuth</h3>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">Link GitHub → Automatic discovery</h3>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold">Queue prompts → Start with 5-10 related tasks</h3>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">5</span>
              </div>
              <h3 className="font-semibold">Push batch → Click "Send to Cursor Multi-Agent"</h3>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">6</span>
              </div>
              <h3 className="font-semibold">Watch magic → Multiple AI agents work simultaneously</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">FREE During Beta</CardTitle>
                  <Badge className="bg-primary">Current</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Full Multi-Agent integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Unlimited prompt queuing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">All GitHub features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pro Plan</CardTitle>
                  <Badge variant="outline">January 2025</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Advanced batching algorithms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Team collaboration features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Enterprise integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Priority processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            The Future is Parallel, Not Sequential
          </h2>
          <p className="text-xl text-muted-foreground">
            Join 500+ developers who've transformed their AI workflow from reactive waiting to proactive building.
          </p>
          <p className="text-lg font-medium">
            Ready to ship features 4x faster?
          </p>
          
          <Button size="lg" onClick={handleGetStarted} className="px-8 py-6 text-lg font-medium group">
            Start Queuing Dozens of Prompts - Free
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            No credit card required. Full access during beta.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<img src={chessKnightLogo} alt="Ahead Logo" className="w-8 h-8" />}
        brandName="Ahead"
        socialLinks={[
          {
            icon: <CursorLogo className="h-4 w-4" />,
            href: "https://cursor.sh",
            label: "Cursor"
          },
          {
            icon: <Github className="h-4 w-4" />,
            href: "https://github.com/ahead-love",
            label: "GitHub"
          }
        ]}
        mainLinks={[
          { href: "/", label: "Home" },
          { href: "/build", label: "Dashboard" },
          { href: "/pricing", label: "Pricing" }
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" }
        ]}
        copyright={{
          text: "© 2024 Ahead. All rights reserved.",
          license: "Built with ❤️ for developers who stay ahead."
        }}
      />
    </div>
  );
}