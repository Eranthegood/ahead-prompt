import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type Stage = 0 | 1 | 2 | 3; // 0=create, 1=todo, 2=inprogress, 3=done

const COLUMN_TITLES = [
  { key: "todo", label: "Todo", badge: "Todo" },
  { key: "inprogress", label: "In Progress", badge: "In Progress" },
  { key: "done", label: "Done", badge: "Done" },
] as const;

/**
 * Lightweight, self-running motion demo that visualizes:
 * 1) Creating a task
 * 2) Task appears in Kanban (Todo → In Progress → Done)
 *
 * Built with TailwindCSS + Framer Motion. No external assets.
 */
export default function TaskKanbanMotion() {
  const [stage, setStage] = useState<Stage>(0);

  // Cycle through the demo states continuously
  useEffect(() => {
    let current: Stage = 0;
    const id = setInterval(() => {
      current = (((current + 1) % 4) as Stage);
      setStage(current);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const card = useMemo(
    () => (
      <motion.div
        layoutId="task-card"
        className="rounded-md border border-border bg-background shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Refactor Prompt Dialog</span>
            <Badge variant={stage === 3 ? "success" : stage === 2 ? "secondary" : "outline"} className="ml-2">
              {stage === 3 ? "Done" : stage === 2 ? "In Progress" : "Todo"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Create task → Kanban flow demo
          </p>
        </div>
      </motion.div>
    ),
    [stage]
  );

  return (
    <div className="w-full h-[460px] lg:h-[520px] relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10">
      {/* Floating subtle grid */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)/.35) 1px, transparent 1px),linear-gradient(90deg,hsl(var(--border)/.35) 1px, transparent 1px)`,
          backgroundSize: "28px 28px"
        }}
        animate={{ x: [0, -10, 0], y: [0, -10, 0] }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 h-full w-full p-4 md:p-6 flex flex-col md:flex-row gap-4">
        {/* Creator panel */}
        <div className="md:w-[40%] w-full">
          <div className="h-full rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">New Task</h4>
              <Badge variant="default">/build</Badge>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-md border border-border bg-background p-2">
                <div className="h-8 flex items-center text-xs text-muted-foreground">
                  {stage === 0 ? (
                    <TypingDemo text="Click outside of PromptDialog, close the windows" />
                  ) : (
                    <span>Click outside of PromptDialog, close the windows</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 rounded bg-muted" />
                <div className="w-16 h-8 rounded bg-muted" />
              </div>

              <motion.button
                type="button"
                className="mt-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
                animate={{ scale: stage === 0 ? [1, 1.03, 1] : 1 }}
                transition={{ duration: 1.2, repeat: stage === 0 ? Infinity : 0 }}
                aria-label="Create task"
              >
                Create task
              </motion.button>
            </div>

            {/* Card sits in creator until it jumps to Kanban */}
            <div className="mt-4">
              <AnimatePresence>{stage === 0 && card}</AnimatePresence>
            </div>
          </div>
        </div>

        {/* Kanban board */}
        <div className="md:flex-1 w-full">
          <div className="grid grid-cols-3 gap-3 h-full">
            {COLUMN_TITLES.map((c, columnIndex) => (
              <div
                key={c.key}
                className="rounded-lg border border-border/60 bg-card/70 backdrop-blur-sm p-3 flex flex-col"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
                  <Badge
                    variant={
                      c.key === "done" ? "success" : c.key === "inprogress" ? "secondary" : "outline"
                    }
                    className="text-[10px]"
                  >
                    {c.badge}
                  </Badge>
                </div>

                <div className="flex-1 min-h-[140px] space-y-2">
                  {/* Render task card inside the active column for stages 1..3 */}
                  {stage > 0 && columnIndex === stage - 1 ? card : null}

                  {/* Static filler items to hint at a real board */}
                  <div className="rounded-md border border-dashed border-border/60 bg-transparent h-8" />
                  <div className="rounded-md border border-dashed border-border/60 bg-transparent h-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingDemo({ text }: { text: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const id = setInterval(() => {
      setShown((s) => (s < text.length ? s + 1 : s));
    }, 30);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span className="font-mono">
      {text.slice(0, shown)}
      <motion.span
        className="inline-block w-[1ch]"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      >
        |
      </motion.span>
    </span>
  );
}

