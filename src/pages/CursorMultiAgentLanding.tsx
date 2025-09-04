import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Clock, CheckCircle, TrendingUp, Star, Layers, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


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
      quote: "Built my entire SaaS backend in one afternoon. Queued 47 prompts - all executed simultaneously.",
      name: "Lisa",
      role: "Indie Hacker",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="text-sm font-medium px-4 py-2">
            Revolutionary Multi-Agent Technology
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Stop Waiting for AI.<br />
            <span className="text-primary">Start Parallel Processing.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Queue dozens of prompts. Execute them all simultaneously with Cursor Multi-Agent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={handleGetStarted} className="px-8 py-6 text-lg font-medium group">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            No credit card required • Full access during beta
          </p>
        </div>
      </main>

      {/* The Problem */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Traditional AI Development is Painfully Slow
            </h2>
            <p className="text-xl text-muted-foreground">
              Write prompt → Wait 4 minutes → Write next → Wait again...
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  The Old Way
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Build features one component at a time</p>
                <p>• Lose momentum during generation</p>
                <p>• Forget ideas while waiting</p>
                <p className="font-bold text-destructive">Result: Hours of wasted time</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-primary/5 text-left">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  The Ahead Way
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>• Queue dozens of prompts in minutes</p>
                <p>• Execute them all simultaneously</p>
                <p>• Ship complete features in parallel</p>
                <p className="font-bold text-primary">Result: 4x faster delivery</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Real Results: E-commerce Dashboard
          </h2>
          
          <div className="bg-muted/30 rounded-lg p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-destructive mb-2">36 min</div>
                <p className="text-muted-foreground">Traditional approach<br/>Building 10 components sequentially</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10 min</div>
                <p className="text-muted-foreground">Ahead Multi-Agent<br/>All components built in parallel</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-lg font-bold text-primary">
              <TrendingUp className="w-5 h-5" />
              <span>3.6x faster delivery</span>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Developers Are Shipping 4x Faster
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="pt-6 text-left">
                  <div className="flex items-start gap-4">
                    <Star className="w-5 h-5 fill-primary text-primary flex-shrink-0 mt-1" />
                    <div className="space-y-3">
                      <blockquote className="text-lg">
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
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Layers className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">1. Queue Prompts</h3>
              <p className="text-muted-foreground">Organize and prioritize your AI tasks in seconds</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">2. Batch Execute</h3>
              <p className="text-muted-foreground">Send multiple prompts to Cursor simultaneously</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Code className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">3. Ship Faster</h3>
              <p className="text-muted-foreground">Get complete features built in parallel</p>
            </div>
          </div>
        </div>
      </section>



      {/* Pricing */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Free During Beta
          </h2>
          
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="pt-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-lg">Full Multi-Agent integration</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-lg">Unlimited prompt queuing</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-lg">Priority support</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-muted-foreground">
            No credit card required. Get full access while we're in beta.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Ship Features 4x Faster?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join developers who've transformed their AI workflow from reactive waiting to proactive building.
          </p>
          
          <Button size="lg" onClick={handleGetStarted} className="px-8 py-6 text-lg font-medium group">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            No credit card required • Full access during beta
          </p>
        </div>
      </section>
    </div>
  );
}