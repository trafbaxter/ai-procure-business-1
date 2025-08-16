// Centralized AWS Credentials Management
export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  isValid: boolean;
  error?: string;
}

// Sanitize and validate credentials
function sanitizeCredential(credential: string): string {
  return credential ? credential.trim() : '';
}

function validateAccessKey(accessKey: string): boolean {
  // AWS Access Keys should start with AKIA and be 20 characters long
  return accessKey.startsWith('AKIA') && accessKey.length === 20;
}

function validateSecretKey(secretKey: string): boolean {
  // AWS Secret Keys should be 40 characters long
  return secretKey.length === 40;
}

// Get and validate AWS credentials
export function getAwsCredentials(): AwsCredentials {
  const rawAccessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID || '';
  const rawSecretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '';
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';

  // Sanitize credentials
  const accessKeyId = sanitizeCredential(rawAccessKey);
  const secretAccessKey = sanitizeCredential(rawSecretKey);

  // Validate credentials
  let isValid = true;
  let error = '';

  if (!accessKeyId || !secretAccessKey) {
    isValid = false;
    error = 'Missing AWS credentials';
  } else if (!validateAccessKey(accessKeyId)) {
    isValid = false;
    error = 'Invalid AWS Access Key format (should start with AKIA and be 20 chars)';
  } else if (!validateSecretKey(secretAccessKey)) {
    isValid = false;
    error = 'Invalid AWS Secret Key format (should be 40 chars)';
  }

  const credentials: AwsCredentials = {
    accessKeyId,
    secretAccessKey,
    region,
    isValid,
    error
  };

  // Debug logging
  console.log('🔧 AWS Credentials Check:', {
    hasAccessKey: !!accessKeyId,
    hasSecretKey: !!secretAccessKey,
    accessKeyFormat: accessKeyId ? `${accessKeyId.substring(0, 4)}...${accessKeyId.substring(16)}` : 'NOT SET',
    secretKeyLength: secretAccessKey.length,
    region,
    isValid,
    error: error || 'None'
  });

  return credentials;
}

// Create DynamoDB client configuration
export function getDynamoDBClientConfig() {
  const credentials = getAwsCredentials();
  
  if (!credentials.isValid) {
    console.warn('⚠️ Invalid AWS credentials:', credentials.error);
    return null;
  }

  return {
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  };
}