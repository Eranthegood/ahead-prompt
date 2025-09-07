import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

interface EnhancedScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  showIndicators?: boolean;
  onScrollChange?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

const EnhancedScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  EnhancedScrollAreaProps
>(({ className, children, showIndicators = true, onScrollChange, ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [showTopIndicator, setShowTopIndicator] = React.useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = React.useState(false);

  const handleScroll = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    
    // Update indicators
    setShowTopIndicator(scrollTop > 10);
    setShowBottomIndicator(scrollTop < scrollHeight - clientHeight - 10);
    
    // Call external handler
    onScrollChange?.(scrollTop, scrollHeight, clientHeight);
  }, [onScrollChange]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Initial check
    handleScroll();
    
    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="relative">
      {/* Top scroll indicator */}
      {showIndicators && (
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300",
            showTopIndicator ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden enhanced-scroll-area", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport 
          ref={viewportRef}
          className="h-full w-full rounded-[inherit]"
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <EnhancedScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>

      {/* Bottom scroll indicator */}
      {showIndicators && (
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300",
            showBottomIndicator ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
});
EnhancedScrollArea.displayName = "EnhancedScrollArea";

const EnhancedScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-all duration-300 hover:bg-muted/30 rounded-sm",
      orientation === "vertical" &&
        "h-full w-3 border-l border-l-transparent p-[1px] mr-1",
      orientation === "horizontal" &&
        "h-3 flex-col border-t border-t-transparent p-[1px] mb-1",
      "enhanced-scrollbar",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border/60 hover:bg-border/80 transition-colors duration-200 min-h-[40px]" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
EnhancedScrollBar.displayName = "EnhancedScrollBar";

export { EnhancedScrollArea, EnhancedScrollBar };