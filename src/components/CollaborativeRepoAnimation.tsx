import { motion } from "framer-motion";
import { Bot, Folder } from "lucide-react";

const CollaborativeRepoAnimation = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] scale-50 md:scale-75 lg:scale-90 xl:scale-100">
          
          {/* Background Grid */}
          <motion.div
            className="absolute inset-0 opacity-30"
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

          {/* Title */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center text-foreground">
            <motion.h1 
              className="text-4xl font-bold mb-2"
              animate={{
                textShadow: [
                  "0 0 10px hsl(var(--foreground) / 0.3)",
                  "0 0 20px hsl(var(--foreground) / 0.6)",
                  "0 0 10px hsl(var(--foreground) / 0.3)"
                ]
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity
              }}
            >
              Collaborative Repository Activity
            </motion.h1>
            <p className="text-xl text-muted-foreground">
              Multiple Agents Working Simultaneously
            </p>
          </div>

          {/* Central Repository */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              className="w-60 h-60 rounded-full flex items-center justify-center relative"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary)) 100%)"
              }}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 40px hsl(var(--primary) / 0.5)",
                  "0 0 60px hsl(var(--primary) / 0.8)",
                  "0 0 40px hsl(var(--primary) / 0.5)"
                ]
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity
              }}
            >
              <Folder className="w-12 h-12 text-primary-foreground" />
              
              {/* Queue Section */}
              <motion.div
                className="absolute -top-44 left-1/2 transform -translate-x-1/2 bg-muted/90 border-2 border-border rounded-3xl px-8 py-3 text-foreground font-bold text-sm text-center"
                animate={{
                  boxShadow: [
                    "0 0 10px hsl(var(--primary) / 0.3)",
                    "0 0 20px hsl(var(--primary) / 0.6)",
                    "0 0 10px hsl(var(--primary) / 0.3)"
                  ]
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              >
                Queue Dozens of Prompts
                
                {/* Prompt Indicators */}
                <div className="absolute -bottom-11 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {[
                    "hsl(142 76% 36%)", // Green
                    "hsl(38 92% 50%)",  // Orange  
                    "hsl(0 84% 60%)",   // Red
                    "hsl(248 53% 58%)", // Purple
                    "hsl(186 100% 37%)", // Cyan
                    "hsl(84 81% 44%)"   // Lime
                  ].map((color, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-2 rounded-sm"
                      style={{ background: color }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Agent 1 - Top Left (Generating) */}
          <motion.div
            className="absolute top-52 left-96"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(142 76% 36%) 0%, hsl(142 72% 29%) 100%)",
                filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))"
              }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap">
              GENERATING
            </div>
          </motion.div>

          {/* Agent 2 - Top Right (Coding) */}
          <motion.div
            className="absolute top-52 right-96"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(32 95% 44%) 100%)",
                filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))"
              }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap">
              CODING
            </div>
          </motion.div>

          {/* Agent 3 - Bottom Left (PR Ready) */}
          <motion.div
            className="absolute bottom-52 left-96"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 2
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(0 72% 51%) 100%)",
                filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))"
              }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap">
              PR READY
            </div>
          </motion.div>

          {/* Agent 4 - Bottom Right (Merged) */}
          <motion.div
            className="absolute bottom-52 right-96"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 3
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(248 53% 58%) 0%, hsl(243 75% 59%) 100%)",
                filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))"
              }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap">
              MERGED
            </div>
          </motion.div>

          {/* Flow Lines */}
          {/* Flow 1 - Top Left to Center */}
          <motion.div
            className="absolute top-72 left-[480px] w-72 h-1 opacity-70 origin-left"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(186 100% 37%) 50%, transparent 100%)",
              transform: "rotate(25deg)"
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0
            }}
          >
            <motion.div
              className="absolute top-0 left-0 w-2 h-2 rounded-full"
              style={{ background: "hsl(142 76% 36%)" }}
              animate={{
                x: [0, 280],
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
                delay: 0,
                times: [0, 0.1, 0.9, 1]
              }}
            />
          </motion.div>

          {/* Flow 2 - Top Right to Center */}
          <motion.div
            className="absolute top-72 right-[480px] w-72 h-1 opacity-70 origin-right"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(186 100% 37%) 50%, transparent 100%)",
              transform: "rotate(-25deg)"
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0.5
            }}
          >
            <motion.div
              className="absolute top-0 right-0 w-2 h-2 rounded-full"
              style={{ background: "hsl(38 92% 50%)" }}
              animate={{
                x: [0, -280],
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
                delay: 1,
                times: [0, 0.1, 0.9, 1]
              }}
            />
          </motion.div>

          {/* Flow 3 - Bottom Left to Center */}
          <motion.div
            className="absolute bottom-72 left-[480px] w-72 h-1 opacity-70 origin-left"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(186 100% 37%) 50%, transparent 100%)",
              transform: "rotate(-25deg)"
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1
            }}
          >
            <motion.div
              className="absolute top-0 left-0 w-2 h-2 rounded-full"
              style={{ background: "hsl(0 84% 60%)" }}
              animate={{
                x: [0, 280],
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
                delay: 2,
                times: [0, 0.1, 0.9, 1]
              }}
            />
          </motion.div>

          {/* Flow 4 - Bottom Right to Center */}
          <motion.div
            className="absolute bottom-72 right-[480px] w-72 h-1 opacity-70 origin-right"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(186 100% 37%) 50%, transparent 100%)",
              transform: "rotate(25deg)"
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.5
            }}
          >
            <motion.div
              className="absolute top-0 right-0 w-2 h-2 rounded-full"
              style={{ background: "hsl(248 53% 58%)" }}
              animate={{
                x: [0, -280],
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
                delay: 3,
                times: [0, 0.1, 0.9, 1]
              }}
            />
          </motion.div>

          {/* Activity Indicators */}
          <motion.div
            className="absolute top-[340px] left-[860px] w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(186 100% 37%)" }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0
            }}
          />

          <motion.div
            className="absolute top-[340px] right-[860px] w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(84 81% 44%)" }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0.7
            }}
          />

          <motion.div
            className="absolute top-[640px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(327 73% 70%)" }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.4
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CollaborativeRepoAnimation;