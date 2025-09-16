import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RedditPixelService } from './services/redditPixelService'
import '@/utils/errorLogger' // Initialize error filtering
import { isSafeMode } from '@/lib/safeMode'
import { ReloadDebug } from '@/components/debug/ReloadDebug'
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
    <ReloadDebug />
    <App />
  </AppStoreProvider>
);
