import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RedditPixelService } from './services/redditPixelService'
import { isSafeMode } from '@/lib/safeMode'
import { getActiveStorageName } from '@/lib/safeStorage'
import { AppStoreProvider } from '@/store/AppStore'

console.info('[App] Boot start');

try {
  // Initialize Reddit Pixel Service only if not in Safe Mode
  if (!isSafeMode()) {
    RedditPixelService.initialize();
  }

  // Log active storage backend for debugging
  console.info(`[App] Active storage: ${getActiveStorageName()}`);

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  );

  console.info('[App] Boot ready');
} catch (error) {
  console.error('[App] Boot failed:', error);
  // Show minimal error UI
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; font-family: system-ui;">
        <h1>Application Error</h1>
        <p>Failed to start the application. Check console for details.</p>
        <button onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
  }
}
