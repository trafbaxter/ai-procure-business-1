import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { getDynamoDBClientConfig } from '@/config/awsCredentials';

// Configure AWS DynamoDB client with centralized credentials
const clientConfig = getDynamoDBClientConfig();
const client = clientConfig ? new DynamoDBClient(clientConfig) : null;
export async function createUsersTable(): Promise<boolean> {
  if (!client) return false;
  const tableName = import.meta.env.VITE_DYNAMODB_USERS_TABLE || 'Procurement-Users';
  
  try {
    try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log(`✅ Table ${tableName} already exists`);
      return true;
    } catch (error) {
      // Table doesn't exist, create it
    }

    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'UserID', KeyType: 'HASH' },
        { AttributeName: 'Email', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'UserID', AttributeType: 'S' },
        { AttributeName: 'Email', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });

    await client.send(command);
    console.log(`✅ Created table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error);
    return false;
  }
}

export async function createApiKeysTable(): Promise<boolean> {
  if (!client) return false;
  const tableName = import.meta.env.VITE_DYNAMODB_API_KEYS_TABLE || 'Procurement-ApiKeys';
  
  try {
    try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log(`✅ Table ${tableName} already exists`);
      return true;
    } catch (error) {
      // Table doesn't exist, create it
    }

    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [{ AttributeName: 'KeyID', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'KeyID', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST'
    });

    await client.send(command);
    console.log(`✅ Created table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error);
    return false;
  }
}

export async function createSessionsTable(): Promise<boolean> {
  if (!client) return false;
  const tableName = import.meta.env.VITE_DYNAMODB_SESSIONS_TABLE || 'Procurement-Sessions';
  
  try {
    try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log(`✅ Table ${tableName} already exists`);
      return true;
    } catch (error) {
      // Table doesn't exist, create it
    }

    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [{ AttributeName: 'SessionID', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'SessionID', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST'
    });

    await client.send(command);
    console.log(`✅ Created table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error);
    return false;
  }
}

export async function createAllTables(): Promise<void> {
  if (!client) {
    console.warn('⚠️ DynamoDB client not configured, skipping table creation');
    return;
  }
  console.log('🔧 Creating DynamoDB tables...');
  await createUsersTable();
  await createApiKeysTable();
  await createSessionsTable();
}