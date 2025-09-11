import { MixpanelProvider } from '@/components/MixpanelProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
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
import Pricing from "./pages/Pricing";
import Dashboard from "./components/Dashboard";
import { BuildThemeWrapper } from "./components/BuildThemeWrapper";
import ProductPage from "./pages/ProductPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import GitCursorSettings from "./pages/GitCursorSettings";
import KeyboardShortcuts from "./pages/KeyboardShortcuts";
import Integrations from "./pages/Integrations";
import CursorIntegration from "./pages/CursorIntegration";
import CursorMultiAgentLanding from "./pages/CursorMultiAgentLanding";
import GitHubIntegration from "./pages/GitHubIntegration";
import LovableIntegration from "./pages/LovableIntegration";
import BoltIntegration from "./pages/BoltIntegration";
import FigmaIntegration from "./pages/FigmaIntegration";
import RepositoryMapping from "./pages/RepositoryMapping";
import Achievements from "./pages/Achievements";
import ThemeDemo from "./pages/ThemeDemo";
import MixpanelAdmin from "./pages/MixpanelAdmin";
import PromptManagement from "./pages/PromptManagement";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import AIAgents from "./pages/AIAgents";
import ClickToCloseDemoPage from "./pages/ClickToCloseDemo";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
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
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/prompt-management" element={<PromptManagement />} />
                    <Route path="/cursor-multi-agent" element={<CursorMultiAgentLanding />} />
                    <Route path="/build" element={
                      <ProtectedRoute>
                        <BuildThemeWrapper>
                          <Dashboard />
                        </BuildThemeWrapper>
                      </ProtectedRoute>
                    } />
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
                     <Route path="/integrations/lovable" element={
                       <ProtectedRoute>
                         <LovableIntegration />
                       </ProtectedRoute>
                     } />
                     <Route path="/integrations/bolt" element={
                       <ProtectedRoute>
                         <BoltIntegration />
                       </ProtectedRoute>
                     } />
                     <Route path="/integrations/figma" element={
                       <ProtectedRoute>
                         <FigmaIntegration />
                       </ProtectedRoute>
                     } />
                     <Route path="/blog" element={<Blog />} />
                     <Route path="/blog/:slug" element={<BlogPost />} />
                     <Route path="/admin/blog" element={
                       <ProtectedRoute>
                         <AdminBlog />
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
                     <Route path="/theme-demo" element={
                       <ProtectedRoute>
                         <ThemeDemo />
                       </ProtectedRoute>
                     } />
                     <Route path="/admin/mixpanel" element={
                       <ProtectedRoute>
                         <MixpanelAdmin />
                       </ProtectedRoute>
                     } />
                      <Route path="/ai-agents" element={
                        <ProtectedRoute>
                          <AIAgents />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/click-to-close-demo" element={
                        <ClickToCloseDemoPage />
                      } />
                      
                      <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </MixpanelProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeInitializer>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
