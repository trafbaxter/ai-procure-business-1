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
const TABLE_NAME = import.meta.env.VITE_DYNAMODB_USERS_TABLE || 'Procurement-Users';

console.log('🔧 DynamoDB Configuration Check:', { 
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
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
          Email: user.Email,
          Name: user.Name,
          Password: user.Password,
          DateCreated: user.DateCreated,
          IsActive: user.IsActive,
          IsAdmin: user.IsAdmin,
          Deleted: user.Deleted || false,
          mustChangePassword: user.mustChangePassword || false,
          twoFactorEnabled: user.twoFactorEnabled || false,
          approved: user.approved || false,
          status: user.status || 'pending',
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
    // Check credentials before making DynamoDB call
    const hasCredentials = !!(import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY);
    if (!hasCredentials) {
      console.warn('⚠️ AWS credentials not configured, skipping DynamoDB getUserByEmail call');
      return null;
    }

    const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    
    if (!accessKey.startsWith('AKIA') || accessKey.length < 16 || secretKey.length < 32) {
      console.warn('⚠️ Invalid AWS credentials format, skipping DynamoDB getUserByEmail call');
      return null;
    }

    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'Email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      });

      const result = await docClient.send(command);
      const user = result.Items?.[0] as User || null;
      
      if (user) {
        console.log('🔧 Raw DynamoDB user data:', JSON.stringify(user, null, 2));
        console.log('🔧 User 2FA enabled:', user.twoFactorEnabled);
      }
      
      return user;
    } catch (error) {
      console.error('DynamoDB getUserByEmail error:', error);
      // If we get an InvalidSignatureException or similar AWS auth error, return null to fallback to localStorage
      if (error instanceof Error && (
        error.message.includes('InvalidSignatureException') ||
        error.message.includes('UnrecognizedClientException') ||
        error.message.includes('signature')
      )) {
        console.warn('⚠️ AWS credentials appear to be invalid. Please update your AWS Access Key and Secret Key in your .env file.');
        console.warn('⚠️ Falling back to localStorage authentication.');
      }
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    // Check if AWS credentials are configured
    const hasCredentials = !!(import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY);
    if (!hasCredentials) {
      console.warn('⚠️ AWS credentials not configured, skipping DynamoDB call');
      return [];
    }
    
    // Validate credentials format
    const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    
    if (!accessKey.startsWith('AKIA') || accessKey.length < 16) {
      console.warn('⚠️ Invalid AWS Access Key format, skipping DynamoDB call');
      return [];
    }
    
    if (secretKey.length < 32) {
      console.warn('⚠️ Invalid AWS Secret Key format, skipping DynamoDB call');
      return [];
    }
    
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '(attribute_not_exists(Deleted) OR Deleted = :deleted)',
        ExpressionAttributeValues: {
          ':deleted': false,
        },
      });
      const result = await docClient.send(command);
      return result.Items as User[] || [];
    } catch (error) {
      console.error('DynamoDB getAllUsers error:', error);
      // If we get an InvalidSignatureException or similar AWS auth error, return empty array to fallback to localStorage
      if (error instanceof Error && (
        error.message.includes('InvalidSignatureException') ||
        error.message.includes('UnrecognizedClientException') ||
        error.message.includes('signature')
      )) {
        console.warn('⚠️ AWS credentials appear to be invalid. Please update your AWS Access Key and Secret Key in your .env file.');
        console.warn('⚠️ Falling back to localStorage authentication.');
      }
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
        UpdateExpression: 'SET #password = :password, #name = :name, IsActive = :isActive, IsAdmin = :isAdmin, mustChangePassword = :mustChange, twoFactorEnabled = :twoFactor',
        ExpressionAttributeNames: {
          '#password': 'Password',
          '#name': 'Name',
        },
        ExpressionAttributeValues: {
          ':password': user.Password,
          ':name': user.Name || user.Email || 'Unknown User',
          ':isActive': user.IsActive,
          ':isAdmin': user.IsAdmin,
          ':mustChange': user.mustChangePassword || false,
          ':twoFactor': user.twoFactorEnabled || false,
        },
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('DynamoDB updateUser error:', error);
      return false;
    }
  },

  async updateUserTwoFactor(userId: string, email: string, twoFactorEnabled: boolean): Promise<boolean> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          UserID: userId,
          Email: email,
        },
        UpdateExpression: 'SET twoFactorEnabled = :twoFactor',
        ExpressionAttributeValues: {
          ':twoFactor': twoFactorEnabled,
        },
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('DynamoDB updateUserTwoFactor error:', error);
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

  async approveUser(userId: string, email: string): Promise<boolean> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          UserID: userId,
          Email: email,
        },
        UpdateExpression: 'SET approved = :approved, #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':approved': true,
          ':status': 'approved',
        },
      });

      await docClient.send(command);
      
      // Send approval email
      const { emailService } = await import('./emailService');
      const user = await this.getUserByEmail(email);
      if (user) {
        await emailService.sendAccountApprovedEmail(email, user.Name || email);
      }
      
      return true;
    } catch (error) {
      console.error('DynamoDB approveUser error:', error);
      return false;
    }
  },
  async rejectUser(userId: string, email: string, reason?: string): Promise<boolean> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          UserID: userId,
          Email: email,
        },
        UpdateExpression: 'SET approved = :approved, #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':approved': false,
          ':status': 'rejected',
        },
      });

      await docClient.send(command);
      
      // Send rejection email
      const { emailService } = await import('./emailService');
      const user = await this.getUserByEmail(email);
      if (user) {
        await emailService.sendAccountRejectedEmail(email, user.Name || email, reason);
      }
      
      return true;
    } catch (error) {
      console.error('DynamoDB rejectUser error:', error);
      return false;
    }
  },

  async getPendingUsers(): Promise<User[]> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#status = :status AND (attribute_not_exists(Deleted) OR Deleted = :deleted)',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'pending',
          ':deleted': false,
        },
      });
      const result = await docClient.send(command);
      return result.Items as User[] || [];
    } catch (error) {
      console.error('DynamoDB getPendingUsers error:', error);
      return [];
    }
  },
};