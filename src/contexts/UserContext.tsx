import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CreateUserData } from '@/types/user';
import { toast } from '@/components/ui/use-toast';
import { hashPassword } from '@/utils/encryption';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  createUser: (userData: CreateUserData) => void;
  removeUser: (userId: string) => void;
  updateUserRole: (userId: string, role: 'admin' | 'user') => void;
  setUserPassword: (userId: string, password: string, mustChangePassword?: boolean) => Promise<void>;
  isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>({
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    createdAt: new Date(),
    status: 'active'
  });

  const [users, setUsers] = useState<User[]>([]);

  // Load users from localStorage and listen for changes
  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = localStorage.getItem('app_users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers).map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt)
        }));
        setUsers([currentUser, ...parsedUsers.filter((u: User) => u.id !== currentUser.id)]);
      } else {
        setUsers([
          currentUser,
          {
            id: '2',
            name: 'John Doe',
            email: 'john@company.com',
            role: 'user',
            createdAt: new Date(),
            status: 'active'
          }
        ]);
      }
    };

    loadUsers();

    // Listen for storage changes to update users when password is changed
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_users') {
        loadUsers();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save users to localStorage whenever users change
  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const createUser = (userData: CreateUserData) => {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      status: 'active'
    };
    setUsers(prev => [...prev, newUser]);
    toast({ title: 'User created successfully' });
  };

  const removeUser = (userId: string) => {
    if (userId === currentUser.id) {
      toast({ title: 'Cannot delete current user', variant: 'destructive' });
      return;
    }
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    const credentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
    delete credentials[userId];
    localStorage.setItem('user_credentials', JSON.stringify(credentials));
    
    toast({ title: 'User removed successfully' });
  };

  const updateUserRole = (userId: string, role: 'admin' | 'user') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role } : user
    ));
    toast({ title: 'User role updated successfully' });
  };

  const setUserPassword = async (userId: string, password: string, mustChangePassword?: boolean) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const hashedPassword = hashPassword(password);
      
      const credentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
      credentials[userId] = hashedPassword;
      localStorage.setItem('user_credentials', JSON.stringify(credentials));
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, mustChangePassword } : u
      ));
      
      toast({ title: 'Password set successfully' });
      
    } catch (error) {
      console.error('Failed to set password:', error);
      toast({ title: 'Failed to set password', variant: 'destructive' });
      throw error;
    }
  };

  const isAdmin = () => currentUser?.role === 'admin';

  return (
    <UserContext.Provider value={{
      users,
      currentUser,
      createUser,
      removeUser,
      updateUserRole,
      setUserPassword,
      isAdmin
    }}>
      {children}
    </UserContext.Provider>
  );
};