import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@company.com' && password === 'admin123') {
        const userData = {
          id: '1',
          name: 'Admin User',
          email: 'admin@company.com',
          role: 'admin' as const
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        toast({ title: 'Login successful' });
        return true;
      }
      
      toast({ title: 'Invalid credentials', variant: 'destructive' });
      return false;
    } catch (error) {
      toast({ title: 'Login failed', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        id: provider === 'google' ? 'google_123' : 'github_456',
        name: provider === 'google' ? 'Google User' : 'GitHub User',
        email: `user@${provider}.com`,
        avatar: `https://via.placeholder.com/40?text=${provider.charAt(0).toUpperCase()}`,
        role: 'user' as const
      };
      
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      toast({ title: `${provider} login successful` });
      return true;
    } catch (error) {
      toast({ title: `${provider} login failed`, variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Simulate sending reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    } catch (error) {
      return false;
    }
  };

  const updatePassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      // Simulate password update
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast({ title: 'Logged out successfully' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithOAuth,
      logout,
      resetPassword,
      updatePassword,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};