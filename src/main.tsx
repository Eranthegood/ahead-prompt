import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RedditPixelService } from './services/redditPixelService'
import '@/utils/errorLogger' // Initialize error filtering

// Initialize Reddit Pixel Service
RedditPixelService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
