import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_CONFIG, isDynamoDBEnabled } from '@/config/dynamodb';

const client = new DynamoDBClient({ region: DYNAMODB_CONFIG.region });
const docClient = DynamoDBDocumentClient.from(client);

export interface ApiKey {
  ApiKeyID: string;
  UserID: string;
  name: string;
  keyHash: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  permissions: string[];
}

export const dynamoApiKeyService = {
  async getApiKey(ApiKeyID: string): Promise<ApiKey | null> {
    if (!isDynamoDBEnabled()) return null;
    
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        FilterExpression: 'ApiKeyID = :apiKeyId AND App = :app',
        ExpressionAttributeValues: {
          ':apiKeyId': ApiKeyID,
          ':app': 'Procurement'
        }
      }));
      return result.Items?.[0] as ApiKey || null;
    } catch (error) {
      console.error('DynamoDB getApiKey error:', error);
      return null;
    }
  },

  async getAllApiKeys(): Promise<ApiKey[]> {
    if (!isDynamoDBEnabled()) return [];
    
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        FilterExpression: 'App = :app',
        ExpressionAttributeValues: {
          ':app': 'Procurement'
        }
      }));
      return result.Items as ApiKey[] || [];
    } catch (error) {
      console.error('DynamoDB getAllApiKeys error:', error);
      return [];
    }
  },

  async createApiKey(apiKey: ApiKey): Promise<boolean> {
    if (!isDynamoDBEnabled()) return false;
    
    try {
      await docClient.send(new PutCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        Item: { ...apiKey, App: 'Procurement' }
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB createApiKey error:', error);
      return false;
    }
  },

  async updateApiKey(ApiKeyID: string, updates: Partial<ApiKey>): Promise<boolean> {
    if (!isDynamoDBEnabled()) return false;
    
    try {
      const updateExpression = Object.keys(updates).map(key => `#${key} = :${key}`).join(', ');
      const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => ({
        ...acc,
        [`#${key}`]: key
      }), {});
      const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => ({
        ...acc,
        [`:${key}`]: updates[key as keyof ApiKey]
      }), {});

      await docClient.send(new UpdateCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        Key: { ApiKeyID },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB updateApiKey error:', error);
      return false;
    }
  },

  async deleteApiKey(ApiKeyID: string): Promise<boolean> {
    if (!isDynamoDBEnabled()) return false;
    
    try {
      await docClient.send(new DeleteCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        Key: { ApiKeyID }
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB deleteApiKey error:', error);
      return false;
    }
  }
};