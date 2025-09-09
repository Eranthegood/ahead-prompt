import React, { forwardRef, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { ArrowRight, Bot, Code, GitBranch, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const Circle = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children?: React.ReactNode;
    pulse?: boolean;
  }
>(({ className, children, pulse = false }, ref) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative z-10 flex size-12 items-center justify-center rounded-full border-2 p-3",
        "bg-neutral-900/70 border-white/10 text-white shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
      {pulse && !reduceMotion && (
        <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse" />
      )}
    </motion.div>
  );
});

Circle.displayName = "Circle";

export const AutomationHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const orchestratorRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePrimary = () => {
    navigate("/build");
  };

  return (
    <section className="w-full">
      <div className="relative isolate w-full overflow-hidden rounded-3xl border border-white/10 bg-black">
        {/* Glow accents */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

        {/* Subtle animated gradient wash */}
        {!reduceMotion && (
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(80,80,80,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.12),transparent_45%)]"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        )}

        {/* Soft grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 md:py-28">
          <div className="text-center space-y-6">
            <h1 className="text-balance text-3xl sm:text-5xl md:text-6xl font-bold leading-tight text-white">
              Stay <span className="text-primary">3 moves ahead</span>
              <br />
              while AI generates your code
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
              Queue your next prompts while AI works
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button size="lg" onClick={handlePrimary} className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group">
                {user ? "Build" : "Get Ahead - Free"}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Automation diagram */}
          <div className="relative mt-12 sm:mt-16">
            <div
              className="relative mx-auto h-[320px] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-neutral-950/60 backdrop-blur"
              ref={containerRef}
            >
              {/* Container background only */}
              <div className="absolute inset-0 bg-neutral-950/40" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 grid-rows-3 items-center justify-items-center w-full h-full px-8 py-6">
                  <div className="col-start-1 row-start-2" />
                  <div className="col-start-2 row-start-1" />
                  <div className="col-start-3 row-start-2" />
                  <div className="col-start-2 row-start-3" />
                </div>
              </div>

              {/* Nodes */}
              <div className="absolute inset-0">
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <Circle ref={sourceRef} pulse>
                    <Code className="h-5 w-5" />
                  </Circle>
                </div>
                <div className="absolute left-1/2 top-8 -translate-x-1/2">
                  <Circle ref={orchestratorRef} pulse>
                    <Zap className="h-5 w-5" />
                  </Circle>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Circle ref={aiRef} pulse>
                    <Bot className="h-5 w-5" />
                  </Circle>
                </div>
                <div className="absolute left-1/2 bottom-8 -translate-x-1/2">
                  <Circle ref={outputRef} pulse>
                    <GitBranch className="h-5 w-5" />
                  </Circle>
                </div>
              </div>

              {/* Beams */}
              {!reduceMotion && (
                <>
                  <AnimatedBeam
                    containerRef={containerRef}
                    fromRef={sourceRef}
                    toRef={orchestratorRef}
                    curvature={-40}
                    duration={3}
                    gradientStartColor="hsl(var(--primary))"
                    gradientStopColor="hsl(var(--primary)/0.8)"
                  />
                  <AnimatedBeam
                    containerRef={containerRef}
                    fromRef={orchestratorRef}
                    toRef={aiRef}
                    curvature={40}
                    delay={0.4}
                    duration={3}
                    gradientStartColor="hsl(var(--primary))"
                    gradientStopColor="#8b5cf6"
                  />
                  <AnimatedBeam
                    containerRef={containerRef}
                    fromRef={aiRef}
                    toRef={outputRef}
                    curvature={0}
                    delay={0.9}
                    duration={3}
                    gradientStartColor="#8b5cf6"
                    gradientStopColor="hsl(var(--accent))"
                  />
                </>
              )}
            </div>
          </div>

          {/* Integrations */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8 opacity-80">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
              <span>Integration with</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 group cursor-default">
                <span className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400 group-hover:text-white transition-colors">⌁</span>
                <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">Cursor</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <span className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400 group-hover:text-white transition-colors"></span>
                <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">GitHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutomationHero;

