import { motion } from "framer-motion";
const CollaborativeRepoAnimation = () => {
  return <div className="w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gradients adapted to Ahead theme */}
          <radialGradient id="repoGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          </radialGradient>
          
          <linearGradient id="agentGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(142 72% 29%)" stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="agentGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(32 95% 44%)" stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="agentGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(0 72% 51%)" stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="agentGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(248 53% 58%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(243 75% 59%)" stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          
          {/* Glow effects */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge> 
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="pulse" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge> 
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background */}
        <rect width="400" height="300" fill="transparent" />
        
        {/* Central Repository */}
        <g transform="translate(200, 150)">
          {/* Repository base */}
          <motion.circle r="30" fill="url(#repoGradient)" filter="url(#glow)" animate={{
          scale: [1, 1.05, 1]
        }} transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          
          {/* Repository icon */}
          <g fill="white" opacity="0.9">
            <path d="M-10 -5 L-10 -8 L-6 -8 L-5 -7 L10 -7 L10 5 L-10 5 Z" stroke="white" strokeWidth="1" fill="none" />
            <rect x="-7" y="-2" width="5" height="1" fill="white" opacity="0.7" />
            <rect x="-7" y="0" width="8" height="1" fill="white" opacity="0.7" />
            <rect x="-7" y="2" width="6" height="1" fill="white" opacity="0.7" />
          </g>
          
          {/* Queue indicator */}
          <g transform="translate(0, -45)">
            <rect x="-20" y="-6" width="40" height="12" rx="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
            
            
            {/* Queue visualization */}
            <g transform="translate(-12, -10)">
              {[0, 1, 2, 3, 4, 5].map(i => <motion.rect key={i} x={i * 4} width="3" height="2" rx="1" fill="hsl(var(--primary))" opacity="0.8" animate={{
              opacity: [0.4, 1, 0.4]
            }} transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }} />)}
            </g>
          </g>
        </g>
        
        {/* Agent 1 - Top Left (Generating) */}
        <g transform="translate(80, 60)">
          <motion.circle r="12" fill="url(#agentGradient1)" filter="url(#pulse)" animate={{
          scale: [1, 1.1, 1]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          <g fill="white">
            <rect x="-4" y="-5" width="8" height="6" rx="1" fill="white" />
            <circle cx="-2" cy="-3" r="1" fill="#10B981" />
            <circle cx="2" cy="-3" r="1" fill="#10B981" />
          </g>
          
          <g transform="translate(0, 18)">
            <rect x="-8" y="-2" width="16" height="4" rx="2" fill="hsl(142 72% 29%)" opacity="0.9" />
            <text x="0" y="1" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">
              GENERATING
            </text>
          </g>
        </g>
        
        {/* Agent 2 - Top Right (Coding) */}
        <g transform="translate(320, 60)">
          <motion.circle r="12" fill="url(#agentGradient2)" filter="url(#pulse)" animate={{
          scale: [1, 1.1, 1]
        }} transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          <g fill="white">
            <rect x="-4" y="-5" width="8" height="6" rx="1" fill="white" />
            <circle cx="-2" cy="-3" r="1" fill="#F59E0B" />
            <circle cx="2" cy="-3" r="1" fill="#F59E0B" />
          </g>
          
          <g transform="translate(0, 18)">
            <rect x="-8" y="-2" width="16" height="4" rx="2" fill="hsl(32 95% 44%)" opacity="0.9" />
            <text x="0" y="1" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">
              CODING
            </text>
          </g>
        </g>
        
        {/* Agent 3 - Bottom Left (PR Ready) */}
        <g transform="translate(80, 240)">
          <motion.circle r="12" fill="url(#agentGradient3)" filter="url(#pulse)" animate={{
          scale: [1, 1.1, 1]
        }} transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          <g fill="white">
            <rect x="-4" y="-5" width="8" height="6" rx="1" fill="white" />
            <circle cx="-2" cy="-3" r="1" fill="#EF4444" />
            <circle cx="2" cy="-3" r="1" fill="#EF4444" />
          </g>
          
          <g transform="translate(0, 18)">
            <rect x="-8" y="-2" width="16" height="4" rx="2" fill="hsl(0 72% 51%)" opacity="0.9" />
            <text x="0" y="1" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">
              PR READY
            </text>
          </g>
        </g>
        
        {/* Agent 4 - Bottom Right (Merged) */}
        <g transform="translate(320, 240)">
          <motion.circle r="12" fill="url(#agentGradient4)" filter="url(#pulse)" animate={{
          scale: [1, 1.1, 1]
        }} transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          <g fill="white">
            <rect x="-4" y="-5" width="8" height="6" rx="1" fill="white" />
            <circle cx="-2" cy="-3" r="1" fill="#8B5CF6" />
            <circle cx="2" cy="-3" r="1" fill="#8B5CF6" />
          </g>
          
          <g transform="translate(0, 18)">
            <rect x="-8" y="-2" width="16" height="4" rx="2" fill="hsl(243 75% 59%)" opacity="0.9" />
            <text x="0" y="1" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">
              MERGED
            </text>
          </g>
        </g>
        
        {/* Flow Lines from Agents to Repository */}
        {/* Agent 1 to Repository */}
        <g>
          <path d="M 92 66 Q 140 80 185 120" fill="none" stroke="url(#flowGradient)" strokeWidth="2" opacity="0.6" />
          <motion.circle r="2" fill="#10B981" opacity="0.8" initial={{
          pathOffset: 0
        }} animate={{
          pathOffset: 1
        }} transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}>
            <animateMotion dur="3s" repeatCount="indefinite">
              <path d="M 92 66 Q 140 80 185 120" />
            </animateMotion>
          </motion.circle>
        </g>
        
        {/* Agent 2 to Repository */}
        <g>
          <path d="M 308 66 Q 260 80 215 120" fill="none" stroke="url(#flowGradient)" strokeWidth="2" opacity="0.6" />
          <motion.circle r="2" fill="#F59E0B" opacity="0.8">
            <animateMotion dur="2.5s" repeatCount="indefinite">
              <path d="M 308 66 Q 260 80 215 120" />
            </animateMotion>
          </motion.circle>
        </g>
        
        {/* Agent 3 to Repository */}
        <g>
          <path d="M 92 234 Q 140 220 185 180" fill="none" stroke="url(#flowGradient)" strokeWidth="2" opacity="0.6" />
          <motion.circle r="2" fill="#EF4444" opacity="0.8">
            <animateMotion dur="3.5s" repeatCount="indefinite">
              <path d="M 92 234 Q 140 220 185 180" />
            </animateMotion>
          </motion.circle>
        </g>
        
        {/* Agent 4 to Repository */}
        <g>
          <path d="M 308 234 Q 260 220 215 180" fill="none" stroke="url(#flowGradient)" strokeWidth="2" opacity="0.6" />
          <motion.circle r="2" fill="#8B5CF6" opacity="0.8">
            <animateMotion dur="2.8s" repeatCount="indefinite">
              <path d="M 308 234 Q 260 220 215 180" />
            </animateMotion>
          </motion.circle>
        </g>
        
        {/* Activity indicators around repository */}
        <g transform="translate(200, 150)">
          <motion.circle r="2" fill="hsl(var(--primary))" opacity="0.6" transform="translate(-25, -10)" animate={{
          opacity: [0.6, 1, 0.6]
        }} transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          <motion.circle r="2" fill="hsl(var(--accent))" opacity="0.6" transform="translate(25, -10)" animate={{
          opacity: [0.6, 1, 0.6]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          <motion.circle r="2" fill="hsl(var(--secondary))" opacity="0.6" transform="translate(0, 25)" animate={{
          opacity: [0.6, 1, 0.6]
        }} transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
        </g>
      </svg>
    </div>;
};
export default CollaborativeRepoAnimation;