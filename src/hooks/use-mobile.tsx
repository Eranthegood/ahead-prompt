import * as React from "react"

const MOBILE_BREAKPOINT = 900 // Increased to include tablets and touch devices

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const widthQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const touchQuery = window.matchMedia('(pointer: coarse)')
    
    const onChange = () => {
      const isNarrowScreen = window.innerWidth < MOBILE_BREAKPOINT
      const isTouchDevice = touchQuery.matches
      const newIsMobile = isNarrowScreen || isTouchDevice
      
      setIsMobile(newIsMobile)
      console.log('useIsMobile:', { 
        windowWidth: window.innerWidth, 
        isMobile: newIsMobile, 
        breakpoint: MOBILE_BREAKPOINT,
        isNarrowScreen,
        isTouchDevice 
      })
    }
    
    widthQuery.addEventListener("change", onChange)
    touchQuery.addEventListener("change", onChange)
    onChange() // Call immediately to set initial state
    
    return () => {
      widthQuery.removeEventListener("change", onChange)
      touchQuery.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
