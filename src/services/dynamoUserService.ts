import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_CONFIG, isDynamoDBEnabled } from '@/config/dynamodb';

const client = new DynamoDBClient({ region: DYNAMODB_CONFIG.region });
const docClient = DynamoDBDocumentClient.from(client);

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
  mustChangePassword?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
}

export const dynamoUserService = {
  async getUserById(UserID: string): Promise<User | null> {
    if (!isDynamoDBEnabled()) return null;
    
    try {
      const result = await docClient.send(new GetCommand({
        TableName: DYNAMODB_CONFIG.tables.users,
        Key: { UserID }
      }));
      return result.Item as User || null;
    } catch (error) {
      console.error('DynamoDB getUserById error:', error);
      return null;
    }
  },

  async getUserByEmail(Email: string): Promise<User | null> {
    if (!isDynamoDBEnabled()) return null;
    
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: DYNAMODB_CONFIG.tables.users,
        IndexName: DYNAMODB_CONFIG.indexes.emailIndex,
        KeyConditionExpression: 'Email = :Email',
        ExpressionAttributeValues: { ':Email': Email }
      }));
      return result.Items?.[0] as User || null;
    } catch (error) {
      console.error('DynamoDB getUserByEmail error:', error);
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    if (!isDynamoDBEnabled()) return [];
    
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: DYNAMODB_CONFIG.tables.users
      }));
      return result.Items as User[] || [];
    } catch (error) {
      console.error('DynamoDB getAllUsers error:', error);
      return [];
    }
  },

  async createUser(user: Omit<User, 'DateCreated'>): Promise<boolean> {
    if (!isDynamoDBEnabled()) return false;
    
    try {
      await docClient.send(new PutCommand({
        TableName: DYNAMODB_CONFIG.tables.users,
        Item: {
          ...user,
          DateCreated: new Date().toISOString(),
          IsActive: true,
          Deleted: false
        }
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB createUser error:', error);
      return false;
    }
  },
  async updateUser(user: User): Promise<boolean> {
    if (!isDynamoDBEnabled()) return false;
    
    try {
      await docClient.send(new PutCommand({
        TableName: DYNAMODB_CONFIG.tables.users,
        Item: user
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB updateUser error:', error);
      return false;
    }
  },

  async deleteUser(UserID: string): Promise<boolean> {
    if (!isDynamoDBEnabled()) return false;
    
    try {
      await docClient.send(new UpdateCommand({
        TableName: DYNAMODB_CONFIG.tables.users,
        Key: { UserID },
        UpdateExpression: 'SET Deleted = :deleted',
        ExpressionAttributeValues: { ':deleted': true }
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB deleteUser error:', error);
      return false;
    }
  }
};