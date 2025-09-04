import { MixpanelProvider } from '@/components/MixpanelProvider';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { AppLayout } from "@/components/AppLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProductPage from "./pages/ProductPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import GitCursorSettings from "./pages/GitCursorSettings";
import KeyboardShortcuts from "./pages/KeyboardShortcuts";
import Integrations from "./pages/Integrations";
import CursorIntegration from "./pages/CursorIntegration";
import GitHubIntegration from "./pages/GitHubIntegration";
import RepositoryMapping from "./pages/RepositoryMapping";
import Achievements from "./pages/Achievements";

import FeedbackBubble from "./components/FeedbackBubble";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeInitializer>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <MixpanelProvider>
                <AppLayout>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:productId" element={
                      <ProtectedRoute>
                        <ProductPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings/git-cursor" element={
                      <ProtectedRoute>
                        <GitCursorSettings />
                      </ProtectedRoute>
                    } />
                    <Route path="/shortcuts" element={
                      <ProtectedRoute>
                        <KeyboardShortcuts />
                      </ProtectedRoute>
                    } />
                    <Route path="/integrations" element={
                      <ProtectedRoute>
                        <Integrations />
                      </ProtectedRoute>
                    } />
                     <Route path="/integrations/cursor" element={
                       <ProtectedRoute>
                         <CursorIntegration />
                       </ProtectedRoute>
                     } />
                     <Route path="/integrations/github" element={
                       <ProtectedRoute>
                         <GitHubIntegration />
                       </ProtectedRoute>
                     } />
                     <Route path="/settings/repository-mapping" element={
                       <ProtectedRoute>
                         <RepositoryMapping />
                       </ProtectedRoute>
                     } />
                    <Route path="/achievements" element={
                      <ProtectedRoute>
                        <Achievements />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </MixpanelProvider>
            </BrowserRouter>
            <FeedbackBubble />
          </TooltipProvider>
        </ThemeInitializer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
