export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin?: Date;
  status: 'active' | 'inactive';
  mustChangePassword?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: 'admin' | 'user';
  mustChangePassword?: boolean;
}