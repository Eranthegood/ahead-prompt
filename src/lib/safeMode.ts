export function isSafeMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('safe') || params.get('mode') === 'safe';
  } catch {
    return false;
  }
}
