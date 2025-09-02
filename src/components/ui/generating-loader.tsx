import { Loader2 } from "lucide-react";

interface GeneratingLoaderProps {
  className?: string;
}

export function GeneratingLoader({ className = "" }: GeneratingLoaderProps) {
  return (
    <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Génération en cours...</span>
    </div>
  );
}

export default GeneratingLoader;