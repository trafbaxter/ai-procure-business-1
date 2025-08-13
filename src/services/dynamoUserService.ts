import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  passwordHash: string;
  mustChangePassword?: boolean;
}

export const dynamoUserService = {
  async getUser(id: string): Promise<User | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: 'Users',
        Key: { id }
      }));
      return result.Item as User || null;
    } catch (error) {
      console.error('DynamoDB error:', error);
      return null;
    }
  },

  async createUser(user: User): Promise<boolean> {
    try {
      await docClient.send(new PutCommand({
        TableName: 'Users',
        Item: user
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB error:', error);
      return false;
    }
  }
};