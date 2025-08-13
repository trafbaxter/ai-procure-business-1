import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function createUsersTable(): Promise<boolean> {
  const tableName = import.meta.env.VITE_DYNAMODB_USERS_TABLE || 'Users';
  
  try {
    // Check if table exists
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

export async function createAllTables(): Promise<void> {
  console.log('🔧 Creating DynamoDB tables...');
  await createUsersTable();
}