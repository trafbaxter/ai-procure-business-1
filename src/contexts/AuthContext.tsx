import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { hashPassword, verifyPassword } from '@/utils/encryption';
import { createSession, validateSession, clearSession, refreshSession } from '@/utils/sessionManager';
import { emailService } from '@/services/emailService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  mustChangePassword?: boolean;
}

interface LoginResult {
  success: boolean;
  mustChangePassword?: boolean;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  pendingPasswordChange: User | null;
  completePendingLogin: () => void;
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
  const [pendingPasswordChange, setPendingPasswordChange] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = validateSession();
    if (session) {
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const foundUser = storedUsers.find((u: any) => u.id === session.userId) || 
        (session.userId === '1' ? { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' } : null);
      
      if (foundUser) {
        setUser(foundUser);
        refreshSession();
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      
      // Check admin
      if (email === 'admin@company.com') {
        const adminHash = hashPassword('admin123');
        if (verifyPassword(password, adminHash)) {
          const userData = { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' as const };
          setUser(userData);
          createSession(userData.id, userData.email);
          return { success: true, user: userData };
        }
      }
      
      // Check users
      const foundUser = storedUsers.find((u: any) => u.email === email);
      if (foundUser && storedCredentials[foundUser.id]) {
        if (verifyPassword(password, storedCredentials[foundUser.id])) {
          if (foundUser.mustChangePassword) {
            setPendingPasswordChange(foundUser);
            return { success: true, mustChangePassword: true, user: foundUser };
          }
          
          setUser(foundUser);
          createSession(foundUser.id, foundUser.email);
          return { success: true, user: foundUser };
        }
      }
      
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!pendingPasswordChange && !user) return false;
    
    const targetUser = pendingPasswordChange || user;
    const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
    
    if (!verifyPassword(currentPassword, storedCredentials[targetUser!.id])) {
      return false;
    }
    
    const hashedPassword = hashPassword(newPassword);
    storedCredentials[targetUser!.id] = hashedPassword;
    localStorage.setItem('user_credentials', JSON.stringify(storedCredentials));
    
    if (pendingPasswordChange) {
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === pendingPasswordChange.id);
      if (userIndex !== -1) {
        storedUsers[userIndex].mustChangePassword = false;
        localStorage.setItem('app_users', JSON.stringify(storedUsers));
      }
      
      setUser({ ...pendingPasswordChange, mustChangePassword: false });
      createSession(pendingPasswordChange.id, pendingPasswordChange.email);
      setPendingPasswordChange(null);
    }
    
    return true;
  };

  const completePendingLogin = () => {
    if (pendingPasswordChange) {
      setUser(pendingPasswordChange);
      createSession(pendingPasswordChange.id, pendingPasswordChange.email);
      setPendingPasswordChange(null);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const foundUser = storedUsers.find((u: any) => u.email === email) || 
      (email === 'admin@company.com' ? { id: '1', email } : null);
    
    if (foundUser) {
      const resetToken = emailService.generateResetToken(email, foundUser.id);
      await emailService.sendPasswordResetEmail(email, resetToken);
    }
    return true;
  };

  const updatePassword = async (token: string, newPassword: string): Promise<boolean> => {
    const tokenData = emailService.validateResetToken(token);
    if (!tokenData) return false;

    const hashedPassword = hashPassword(newPassword);
    const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
    storedCredentials[tokenData.userId] = hashedPassword;
    localStorage.setItem('user_credentials', JSON.stringify(storedCredentials));
    
    emailService.consumeResetToken(token);
    return true;
  };

  const logout = () => {
    setUser(null);
    setPendingPasswordChange(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      resetPassword,
      updatePassword,
      changePassword,
      isLoading,
      pendingPasswordChange,
      completePendingLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};