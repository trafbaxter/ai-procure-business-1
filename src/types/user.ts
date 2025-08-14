export interface User {
  UserID: string;
  Name: string;
  Email: string;
  Password: string;
  DateCreated: string;
  IsActive: boolean;
  IsAdmin: boolean;
  Deleted: boolean;
  passwordHash?: string;
  lastLogin?: Date;
  mustChangePassword?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  approved?: boolean; // New field for admin approval
  status?: 'pending' | 'approved' | 'rejected'; // Alternative status field
}

export interface CreateUserData {
  name: string; // UI field name
  email: string; // UI field name
  role: 'admin' | 'user'; // UI field name

  Email?: string; // DynamoDB field name (mapped from email)
  IsAdmin?: boolean; // DynamoDB field name (mapped from role)
  mustChangePassword?: boolean;
}