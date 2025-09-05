import { cn } from "@/lib/utils";

interface LoadingPulseProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingPulse({ className, children }: LoadingPulseProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {children}
    </div>
  );
}

interface AgentWorkingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AgentWorkingIndicator({ className, size = 'md' }: AgentWorkingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-blue-500 rounded-full animate-pulse",
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
        🤖 Agent Working
      </span>
    </div>
  );
}