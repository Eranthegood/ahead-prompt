import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Zap, Code, Layers } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import { BentoGrid1 } from "@/components/ui/bento-grid";
export default function LandingPage() {
  const {
    signInWithGoogle
  } = useAuth();
  const handleGetStarted = async () => {
    await signInWithGoogle();
  };

  const testimonials = [
    {
      img: "https://randomuser.me/api/portraits/men/91.jpg",
      quote: "EldoraUI's components make building UIs effortless great work!",
      name: "Jessie J",
      role: "Acme LTD",
    },
    {
      img: "https://randomuser.me/api/portraits/women/12.jpg",
      quote:
        "EldoraUI simplifies complex designs with ready-to-use components.",
      name: "Nick V",
      role: "Malika Inc.",
    },
    {
      img: "https://randomuser.me/api/portraits/men/45.jpg",
      quote: "With EldoraUI, creating responsive UIs is a breeze.",
      name: "Amelia W",
      role: "Panda AI",
    },
  ];

  return <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono text-xl font-bold text-primary">
            Vibe Plan Forge
          </div>
          <Button variant="ghost" onClick={handleGetStarted} className="text-sm hover:text-primary">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
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

      {/* Testimonials Section */}
      <section aria-labelledby="testimonials-heading" className="py-16 bg-background/50">
        <h3 id="testimonials-heading" className="sr-only">Testimonials</h3>
        <BlurFade delay={1} inView>
          <div className="max-w-5xl mx-auto px-6">
            <TestimonialSlider testimonials={testimonials} />
          </div>
        </BlurFade>
      </section>

      {/* Bento Grid Section */}
      <section className="bg-background">
        <BentoGrid1 />
      </section>

      {/* Footer */}
      <footer className="border-t border-border/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          
        </div>
      </footer>
    </div>;
}