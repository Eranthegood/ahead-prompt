import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RedditPixelService } from './services/redditPixelService'
import '@/utils/errorLogger' // Initialize error filtering
import { isSafeMode } from '@/lib/safeMode'
import { ReloadDebug } from '@/components/debug/ReloadDebug'

// Initialize Reddit Pixel Service only if not in Safe Mode
if (!isSafeMode()) {
  RedditPixelService.initialize();
}

createRoot(document.getElementById("root")!).render(
  <>
    <ReloadDebug />
    <App />
  </>
);
