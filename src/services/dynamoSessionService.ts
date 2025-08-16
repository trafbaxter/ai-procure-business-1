import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_CONFIG } from '@/config/dynamodb';
import { getDynamoDBClientConfig } from '@/config/awsCredentials';

// Configure AWS DynamoDB client with centralized credentials
const clientConfig = getDynamoDBClientConfig();
const client = clientConfig ? new DynamoDBClient(clientConfig) : null;
const docClient = client ? DynamoDBDocumentClient.from(client) : null;

export interface Session {
  SessionID: string;
  UserID: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export const dynamoSessionService = {
  async getSession(SessionID: string): Promise<Session | null> {
    if (!docClient) return null;
    
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: DYNAMODB_CONFIG.tables.sessions,
        FilterExpression: 'SessionID = :sessionId',
        ExpressionAttributeValues: {
          ':sessionId': SessionID
        }
      }));
      return result.Items?.[0] as Session || null;
    } catch (error) {
      console.error('DynamoDB getSession error:', error);
      return null;
    }
  },

  async createSession(session: Session): Promise<boolean> {
    if (!docClient) return false;
    
    try {
      await docClient.send(new PutCommand({
        TableName: DYNAMODB_CONFIG.tables.sessions,
        Item: { ...session}
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB createSession error:', error);
      return false;
    }
  },

  async deleteSession(SessionID: string): Promise<boolean> {
    if (!docClient) return false;
    
    try {
      await docClient.send(new DeleteCommand({
        TableName: DYNAMODB_CONFIG.tables.sessions,
        Key: { SessionID }
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB deleteSession error:', error);
      return false;
    }
  },

  async updateSession(SessionID: string, updates: Partial<Session>): Promise<boolean> {
    if (!docClient) return false;
    
    try {
      const updateExpression = Object.keys(updates).map(key => `#${key} = :${key}`).join(', ');
      const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => ({
        ...acc,
        [`#${key}`]: key
      }), {});
      const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => ({
        ...acc,
        [`:${key}`]: updates[key as keyof Session]
      }), {});

      await docClient.send(new UpdateCommand({
        TableName: DYNAMODB_CONFIG.tables.sessions,
        Key: { SessionID },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB updateSession error:', error);
      return false;
    }
  }
};