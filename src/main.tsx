import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RedditPixelService } from './services/redditPixelService'

// Initialize Reddit Pixel Service
RedditPixelService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
