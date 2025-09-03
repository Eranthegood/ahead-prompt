import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProductPage from "./pages/ProductPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import KeyboardShortcuts from "./pages/KeyboardShortcuts";

import TypeformChatBubble from "./components/TypeformChatBubble";

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
                <Route path="/shortcuts" element={
                  <ProtectedRoute>
                    <KeyboardShortcuts />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <TypeformChatBubble />
          </TooltipProvider>
        </ThemeInitializer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
