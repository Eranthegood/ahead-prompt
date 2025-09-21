export function isSafeMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // First check global flag set by index.html
    if (typeof (window as any).__SAFE_MODE__ === 'boolean') {
      return (window as any).__SAFE_MODE__;
    }
    // Fallback to URL params
    const params = new URLSearchParams(window.location.search);
    return params.has('safe') || params.get('mode') === 'safe';
  } catch {
    return false;
  }
}
