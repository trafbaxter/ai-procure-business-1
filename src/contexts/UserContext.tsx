import React, { createContext, useContext, useState } from 'react';
import { User, CreateUserData } from '@/types/user';
import { toast } from '@/components/ui/use-toast';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  createUser: (userData: CreateUserData) => void;
  removeUser: (userId: string) => void;
  updateUserRole: (userId: string, role: 'admin' | 'user') => void;
  setUserPassword: (userId: string, password: string) => void;
  isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>({
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    createdAt: new Date(),
    status: 'active'
  });

  const [users, setUsers] = useState<User[]>([
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
    toast({ title: 'User removed successfully' });
  };

  const updateUserRole = (userId: string, role: 'admin' | 'user') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role } : user
    ));
    toast({ title: 'User role updated successfully' });
  };

  const setUserPassword = (userId: string, password: string) => {
    // In a real app, this would make an API call to update the password
    // For now, we'll just show a success message
    const user = users.find(u => u.id === userId);
    if (user) {
      toast({ title: `Password updated for ${user.name}` });
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