import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RedditPixelService } from './services/redditPixelService'
import { isSafeMode } from '@/lib/safeMode'
import { getActiveStorageName } from '@/lib/safeStorage'
import { AppStoreProvider } from '@/store/AppStore'

// Initialize Reddit Pixel Service only if not in Safe Mode
if (!isSafeMode()) {
  RedditPixelService.initialize();
}

// Log active storage backend for debugging
console.info(`[App] Active storage: ${getActiveStorageName()}`);

createRoot(document.getElementById("root")!).render(
  <AppStoreProvider>
    <App />
  </AppStoreProvider>
);
