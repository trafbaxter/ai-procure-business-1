import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { User } from '@/types/user';

// Configure AWS DynamoDB client
const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = import.meta.env.VITE_DYNAMODB_USERS_TABLE || 'Users';

console.log('🔧 DynamoDB Configuration Check:', { 
  region: import.meta.env.VITE_AWS_REGION,
  tableName: TABLE_NAME,
  hasCredentials: !!(import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY)
});

export const dynamoUserService = {
  async createUser(user: User): Promise<boolean> {
    try {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          UserID: user.UserID,
          Email: user.Email, // Sort key
          UserName: user.UserName,
          Password: user.Password,
          DateCreated: user.DateCreated,
          IsActive: user.IsActive,
          IsAdmin: user.IsAdmin,
          Deleted: user.Deleted || false,
          mustChangePassword: user.mustChangePassword || false,
        },
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('DynamoDB createUser error:', error);
      return false;
    }
  },

  async getUserById(userId: string): Promise<User | null> {
    try {
      // Since we need both UserID and Email for composite key, scan instead
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'UserID = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      });

      const result = await docClient.send(command);
      return result.Items?.[0] as User || null;
    } catch (error) {
      console.error('DynamoDB getUserById error:', error);
      return null;
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'Email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      });

      const result = await docClient.send(command);
      return result.Items?.[0] as User || null;
    } catch (error) {
      console.error('DynamoDB getUserByEmail error:', error);
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'attribute_not_exists(Deleted) OR Deleted = :deleted',
        ExpressionAttributeValues: {
          ':deleted': false,
        },
      });

      const result = await docClient.send(command);
      return result.Items as User[] || [];
    } catch (error) {
      console.error('DynamoDB getAllUsers error:', error);
      return [];
    }
  },

  async updateUser(user: User): Promise<boolean> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          UserID: user.UserID,
          Email: user.Email,
        },
        UpdateExpression: 'SET #password = :password, IsActive = :isActive, IsAdmin = :isAdmin, mustChangePassword = :mustChange',
        ExpressionAttributeNames: {
          '#password': 'Password',
        },
        ExpressionAttributeValues: {
          ':password': user.Password,
          ':isActive': user.IsActive,
          ':isAdmin': user.IsAdmin,
          ':mustChange': user.mustChangePassword || false,
        },
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('DynamoDB updateUser error:', error);
      return false;
    }
  },

  async deleteUser(userId: string, email: string): Promise<boolean> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          UserID: userId,
          Email: email,
        },
        UpdateExpression: 'SET Deleted = :deleted',
        ExpressionAttributeValues: {
          ':deleted': true,
        },
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('DynamoDB deleteUser error:', error);
      return false;
    }
  },
};