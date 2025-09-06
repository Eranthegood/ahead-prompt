import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Search, Zap, FolderOpen, Target, CheckCircle, Clock, Lightbulb, Star } from "lucide-react";
import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import { Footer } from "@/components/ui/footer";
import { InteractivePromptCards } from "@/components/InteractivePromptCards";

export default function PromptManagementLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSignIn = () => {
    navigate('/build');
  };

  const testimonials = [
    {
      img: "https://randomuser.me/api/portraits/women/25.jpg",
      quote: "No more chaos! My prompts are finally organized and I never lose brilliant ideas again. My productivity has doubled.",
      name: "Marie",
      role: "Full-Stack Developer"
    },
    {
      img: "https://randomuser.me/api/portraits/men/42.jpg",
      quote: "Before, I spent hours searching for old prompts in my notes. Now everything is centralized and instant.",
      name: "Thomas",
      role: "Tech Lead"
    },
    {
      img: "https://randomuser.me/api/portraits/women/33.jpg",
      quote: "Instant capture changes everything. My best ideas always come at the wrong time, now they're saved.",
      name: "Sophie",
      role: "Product Manager"
    },
    {
      img: "https://randomuser.me/api/portraits/men/28.jpg",
      quote: "No more juggling between 10 tabs and documents. Everything is there, organized, ready to use.",
      name: "Julien",
      role: "Indie Hacker"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 pb-16 sm:pb-20 pt-12 sm:pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-primary">Finally more clarity</span>
              <br />
              in your AI prompts
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Transform the chaos of your ideas into an organized and productive system
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button size="lg" onClick={handleSignIn} className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group w-full sm:w-auto">
              {user ? "Get Started" : "Try Free"}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 opacity-60">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Instant organization</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Ultra-fast capture</span>
            </div>
          </div>
        </div>
      </main>

      {/* Instant Note-Taking Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Capture your prompts</span>
                <br />
                instantly
              </h2>
               
               <p className="text-xl text-muted-foreground">
                 Your best ideas always come at the wrong time. Capture them in 2 seconds, organize them automatically.
               </p>
                
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <Lightbulb className="w-5 h-5 text-primary" />
                   <span><strong>Lightning-fast idea capture</strong> - In 2 seconds flat</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <Zap className="w-5 h-5 text-primary" />
                   <span><strong>Keyboard shortcuts</strong> - Never leave your IDE</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <Target className="w-5 h-5 text-primary" />
                   <span><strong>Automatic context</strong> - No more vague prompts</span>
                 </div>
               </div>
                 
               <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                 {user ? "Get Started" : "Test Capture Now"}
                 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
               </Button>
             </div>
             
              <div className="flex items-center justify-center min-h-[600px]">
                <InteractivePromptCards />
              </div>
           </div>
         </div>
       </section>

      {/* Organization & Productivity Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-background rounded-2xl p-8 space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Smart Organization</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Auto-categorization</div>
                      <div className="text-sm text-muted-foreground">By project, epic, priority</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Search className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Instant search</div>
                      <div className="text-sm text-muted-foreground">Find any prompt instantly</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Complete history</div>
                      <div className="text-sm text-muted-foreground">Versions and modifications</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Stay organized</span>
                <br />
                and productive
              </h2>
              
              <p className="text-muted-foreground text-lg">
                Transform your creative chaos into an ultra-productive system. No more prompts lost in Google Docs.
              </p>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Time saved per week</span>
                    <span className="text-2xl font-bold text-primary">5h+</span>
                  </div>
                  <div className="text-sm text-muted-foreground">No more searching through documents</div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Ideas captured</span>
                    <span className="text-2xl font-bold text-primary">100%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Zero creative loss</div>
                </div>
              </div>
                
              <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                {user ? "Get Started" : "Boost My Productivity"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Centralization Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-primary">Centralize</span> all your AI tasks
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One place for all your prompts, ideas, and development tasks. End the multi-platform chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Unified Projects</h3>
              <p className="text-muted-foreground">
                All your projects, epics and prompts in one cohesive workspace
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Knowledge Base</h3>
              <p className="text-muted-foreground">
                Docs, links, snippets - all necessary context centralized
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Universal Export</h3>
              <p className="text-muted-foreground">
                Compatible with all your tools: Cursor, Claude, ChatGPT...
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
              {user ? "Get Started" : "Centralize Now"}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section aria-labelledby="testimonials-heading" className="py-16 bg-background/50">
        <h3 id="testimonials-heading" className="sr-only">Testimonials</h3>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What our users say</h2>
            <p className="text-muted-foreground">Developers who transformed their workflow</p>
          </div>
          <TestimonialSlider testimonials={testimonials} />
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo="🚀"
        brandName="Ahead.love"
        mainLinks={[
          { href: "/", label: "Home" },
          { href: "/prompt-management", label: "Prompt Management" },
          { href: "/pricing", label: "Pricing" },
        ]}
        legalLinks={[
          { href: "#", label: "Privacy Policy" },
          { href: "#", label: "Terms of Service" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} Ahead.love. All rights reserved.`
        }}
      />
    </div>
  );
}