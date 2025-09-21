import { useEffect } from 'react';

export function OnboardingDebug() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('%c[Ahead Onboarding Debug]', 'color: #22c55e; font-weight: bold;');
      console.log('Available commands:');
      console.log('- window.resetOnboarding() - Clear onboarding and show it again');
      console.log('- window.forceOnboarding() - Force show onboarding');
      console.log('- Ctrl+Shift+O - Force show onboarding (keyboard shortcut)');
      console.log('- localStorage.removeItem("ahead-onboarding-completed") - Reset onboarding status');
    }
  }, []);

  // This component doesn't render anything, it's just for debug setup
  return null;
}