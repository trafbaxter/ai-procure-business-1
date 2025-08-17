# AWS Credentials Setup Guide

## Overview
This application requires AWS credentials to access DynamoDB for user management and SES for email functionality.

## Step 1: Create AWS IAM User

1. **Log into AWS Console**
   - Go to https://console.aws.amazon.com
   - Navigate to IAM service

2. **Create New User**
   - Go to IAM → Users → Create User
   - Username: `procurement-app-user` (or your preferred name)
   - Select "Programmatic access"

3. **Attach Policies**
   - Attach the following managed policies:
     - `AmazonDynamoDBFullAccess`
     - `AmazonSESFullAccess`
   
   Or create a custom policy with minimal permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:*",
           "ses:SendEmail",
           "ses:SendRawEmail",
           "ses:GetSendQuota"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

4. **Create Access Key**
   - Go to Security Credentials tab
   - Create Access Key → Application running outside AWS
   - **SAVE THESE CREDENTIALS SECURELY**

## Step 2: Configure Environment Variables

1. **Copy .env.example to .env**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file with your credentials**
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_ACCESS_KEY_ID=AKIA...your_access_key_here
   VITE_AWS_SECRET_ACCESS_KEY=your_40_character_secret_key_here
   VITE_SES_FROM_EMAIL=noreply@taddobbins.com
   VITE_SES_FROM_NAME=Procurement System
   ```

## Step 3: Verify SES Email

1. **Go to AWS SES Console**
   - Navigate to SES in your AWS region
   - Go to Verified Identities

2. **Verify Email Address**
   - Add `noreply@taddobbins.com` (or your domain)
   - Complete email verification process
   - For production, verify your domain

## Step 4: Test Configuration

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Test in Application**
   - Go to Settings → API Settings
   - Use the "Test Connection" button
   - Should show ✅ success message

## Credential Format Validation

- **Access Key ID**: Must start with "AKIA" and be 20 characters
- **Secret Access Key**: Must be exactly 40 characters
- **Region**: Standard AWS region format (e.g., us-east-1)

## Troubleshooting

### InvalidSignatureException
- Double-check your secret access key
- Ensure no extra spaces or characters
- Regenerate access key if needed

### UnrecognizedClientException  
- Check access key ID format
- Must start with "AKIA"

### Access Denied
- Verify IAM permissions
- Ensure DynamoDB and SES policies are attached

## Security Best Practices

1. **Never commit .env to version control**
2. **Use least privilege principle for IAM policies**
3. **Rotate access keys regularly**
4. **Monitor AWS CloudTrail for unusual activity**
5. **Consider using AWS IAM roles in production**

## Production Considerations

- Use AWS IAM roles instead of access keys when possible
- Set up proper VPC and security groups
- Enable AWS CloudTrail logging
- Use AWS Secrets Manager for credential rotation
- Implement proper backup strategies for DynamoDB