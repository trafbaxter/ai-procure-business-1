export interface User {
  UserID: string;
  UserName: string;
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
}

export interface CreateUserData {
  UserName: string;
  Email: string;
  IsAdmin: boolean;
  mustChangePassword?: boolean;
}