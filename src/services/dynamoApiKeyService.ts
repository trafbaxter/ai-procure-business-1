import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_CONFIG } from '@/config/dynamodb';
import { getDynamoDBClientConfig } from '@/config/awsCredentials';

// Configure AWS DynamoDB client with centralized credentials
const clientConfig = getDynamoDBClientConfig();
const client = clientConfig ? new DynamoDBClient(clientConfig) : null;
const docClient = client ? DynamoDBDocumentClient.from(client) : null;

export interface ApiKey {
  KeyID: string;
  UserID: string;
  name: string;
  keyHash: string;
  createdAt: string;
  expiresAt?: string;
  permissions: string[];
}

const TABLE_NAME = import.meta.env.VITE_DYNAMODB_API_KEYS_TABLE || 'Procurement-ApiKeys';

export const dynamoApiKeyService = {
  async getApiKey(KeyID: string): Promise<ApiKey | null> {
    if (!docClient) return null;
    
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        FilterExpression: 'KeyID = :keyId',
        ExpressionAttributeValues: {
          ':keyId': KeyID
        }
      }));
      return result.Items?.[0] as ApiKey || null;
    } catch (error) {
      console.error('DynamoDB getApiKey error:', error);
      return null;
    }
  },

  async getAllApiKeys(): Promise<ApiKey[]> {
    if (!docClient) return [];
    
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys
      }));
      return result.Items as ApiKey[] || [];
    } catch (error) {
      console.error('DynamoDB getAllApiKeys error:', error);
      return [];
    }
  },

  async createApiKey(apiKey: ApiKey): Promise<boolean> {
    if (!docClient) return false;
    
    try {
      await docClient.send(new PutCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        Item: { ...apiKey }
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB createApiKey error:', error);
      return false;
    }
  },

  async updateApiKey(KeyID: string, updates: Partial<ApiKey>): Promise<boolean> {
    if (!docClient) return false;
    
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
        Key: { KeyID },
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

  async deleteApiKey(KeyID: string): Promise<boolean> {
    if (!docClient) return false;
    
    try {
      await docClient.send(new DeleteCommand({
        TableName: DYNAMODB_CONFIG.tables.apiKeys,
        Key: { KeyID }
      }));
      return true;
    } catch (error) {
      console.error('DynamoDB deleteApiKey error:', error);
      return false;
    }
  }
};