import * as React from "react"

const MOBILE_BREAKPOINT = 640 // Reduced from 768 to better match actual mobile devices

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(newIsMobile)
      console.log('useIsMobile:', { windowWidth: window.innerWidth, isMobile: newIsMobile, breakpoint: MOBILE_BREAKPOINT })
    }
    mql.addEventListener("change", onChange)
    onChange() // Call immediately to set initial state
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
