import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SessionTimeout from "@/components/SessionTimeout";
import LoginForm from "@/components/LoginForm";
import ResetPassword from "@/pages/ResetPassword";
import Index from "./pages/Index";
import ApiSettings from "./pages/ApiSettings";
import { UserManagement } from "./pages/UserManagement";
import SecuritySettings from "./pages/SecuritySettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SessionTimeout />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/api-settings" element={
                  <ProtectedRoute>
                    <ApiSettings />
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/security" element={
                  <ProtectedRoute>
                    <SecuritySettings />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;