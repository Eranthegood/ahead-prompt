import { motion } from "framer-motion";
import { Bot, Github, Zap, Code, GitBranch, CheckCircle } from "lucide-react";

const CollaborativeRepoAnimation = () => {
  return (
    <div className="w-full h-[500px] lg:h-[600px] relative overflow-hidden bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/50">
      <div className="absolute inset-0 flex items-center justify-center bg-transparent">
        <div className="relative w-full h-full scale-75 md:scale-85 lg:scale-95">
          
          {/* Background Grid */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px"
            }}
            animate={{
              x: [0, -10, 0],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 20,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />

          {/* Prompt Queue Section */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-4 min-w-[320px] shadow-xl">
              <h3 className="text-base font-semibold text-primary mb-3 text-center">
                Prompt Queue
              </h3>
              <div className="space-y-2">
                {[
                  { text: "Fix authentication bug", color: "hsl(var(--destructive))", status: "pending", priority: "high" },
                  { text: "Add dark mode toggle", color: "hsl(var(--warning))", status: "processing", priority: "high" },
                  { text: "Optimize database queries", color: "hsl(var(--primary))", status: "ready", priority: "normal" },
                  { text: "Update unit tests", color: "hsl(var(--success))", status: "completed", priority: "normal" }
                ].map((prompt, index) => (
                  <motion.div
                    key={prompt.text}
                    className="flex items-center gap-3 p-2 rounded bg-background/60 border border-border/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3, duration: 0.5 }}
                  >
                    {prompt.priority === "high" ? (
                      <span className="text-xs">🔥</span>
                    ) : (
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: prompt.color }}
                        animate={prompt.status === "processing" ? {
                          opacity: [0.3, 1, 0.3],
                          scale: [1, 1.3, 1]
                        } : {}}
                        transition={{
                          duration: 1.5,
                          repeat: prompt.status === "processing" ? Infinity : 0
                        }}
                      />
                    )}
                    <span className="text-sm text-foreground/80 flex-1">{prompt.text}</span>
                    {prompt.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Central Repository */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity
              }}
            >
              <div className="w-20 h-20 flex items-center justify-center bg-primary/5 rounded-full">
                <Github className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            {/* Activity Indicators around Repository */}
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <motion.div
                key={index}
                className="absolute w-2 h-2 bg-primary/60 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transformOrigin: "50% -50px"
                }}
                animate={{
                  rotate: [0, 360],
                  opacity: [0.2, 0.8, 0.2]
                }}
                transition={{
                  duration: 6,
                  delay: index * 1,
                  ease: "linear",
                  repeat: Infinity
                }}
              />
            ))}
          </div>

          {/* Agent Bots */}
          {[
            { position: "top-left", color: "hsl(var(--chart-1))", status: "Generating", icon: Zap, x: "25%", y: "35%" },
            { position: "top-right", color: "hsl(var(--chart-2))", status: "Coding", icon: Code, x: "75%", y: "35%" },
            { position: "bottom-left", color: "hsl(var(--chart-3))", status: "Testing", icon: GitBranch, x: "25%", y: "75%" },
            { position: "bottom-right", color: "hsl(var(--chart-4))", status: "Deploying", icon: CheckCircle, x: "75%", y: "75%" }
          ].map((agent, index) => (
            <div key={agent.position} className="absolute" style={{ left: agent.x, top: agent.y, transform: "translate(-50%, -50%)" }}>
              <motion.div
                className="relative"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{
                  duration: 3,
                  delay: index * 0.5,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              >
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-3 min-w-[120px] shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: agent.color, opacity: 0.2 }}
                    >
                      <Bot className="w-4 h-4" style={{ color: agent.color }} />
                    </div>
                    <span className="text-xs font-medium text-foreground/80">Agent {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <agent.icon className="w-3 h-3" style={{ color: agent.color }} />
                    <span className="text-xs text-muted-foreground">{agent.status}</span>
                  </div>
                </div>
              </motion.div>

              {/* Flow Lines to Repository */}
              <svg 
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{
                  width: '200px',
                  height: '200px',
                  transform: 'translate(-50%, -50%)',
                  zIndex: -1
                }}
              >
                <motion.line
                  x1="100"
                  y1="100"
                  x2={agent.x === "25%" ? "150" : "50"}
                  y2={agent.y === "35%" ? "130" : "70"}
                  stroke={agent.color}
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{
                    duration: 4,
                    delay: index * 0.8,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />
              </svg>
            </div>
          ))}

          {/* Floating Data Packets */}
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              initial={{
                left: "50%",
                top: "50%",
                scale: 0
              }}
              animate={{
                left: [
                  "50%",
                  index % 2 === 0 ? "25%" : "75%",
                  "50%"
                ],
                top: [
                  "50%",
                  index % 3 === 0 ? "35%" : index % 3 === 1 ? "75%" : "45%",
                  "50%"
                ],
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 5,
                delay: index * 0.8,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
          ))}

        </div>
      </div>
    </div>
  );
};

export default CollaborativeRepoAnimation;