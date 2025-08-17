import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Circle, ExternalLink, Copy, AlertTriangle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export function AwsSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: 'Create AWS IAM User', description: 'Set up programmatic access user', completed: false },
    { id: 2, title: 'Configure Permissions', description: 'Attach DynamoDB and SES policies', completed: false },
    { id: 3, title: 'Generate Access Keys', description: 'Create and save credentials', completed: false },
    { id: 4, title: 'Update Environment', description: 'Configure .env file', completed: false },
    { id: 5, title: 'Verify Setup', description: 'Test connection', completed: false }
  ]);

  const markStepComplete = (stepId: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
    if (stepId < 5) setCurrentStep(stepId + 1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const envTemplate = `VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIA...your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_40_character_secret_key_here
VITE_SES_FROM_EMAIL=noreply@taddobbins.com
VITE_SES_FROM_NAME=Procurement System`;

  const iamPolicy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:*",
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>AWS Setup Progress</CardTitle>
          <CardDescription>Follow these steps to configure AWS credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.completed ? 'bg-green-100 border-green-500' : 
                    step.id === currentStep ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-xs text-center mt-2 max-w-20">
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create AWS IAM User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to <a href="https://console.aws.amazon.com/iam/home#/users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">AWS IAM Console <ExternalLink className="w-4 h-4 ml-1" /></a></li>
              <li>Click "Create User"</li>
              <li>Username: <code className="bg-gray-100 px-2 py-1 rounded">procurement-app-user</code></li>
              <li>Select "Programmatic access" only</li>
            </ol>
            <Button onClick={() => markStepComplete(1)}>I've Created the User</Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Configure Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2">Attach these managed policies:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-gray-100 px-2 py-1 rounded">AmazonDynamoDBFullAccess</code></li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">AmazonSESFullAccess</code></li>
              </ul>
            </div>
            <div>
              <p className="mb-2">Or create a custom policy with minimal permissions:</p>
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(iamPolicy)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre className="whitespace-pre-wrap">{iamPolicy}</pre>
              </div>
            </div>
            <Button onClick={() => markStepComplete(2)}>Permissions Configured</Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Generate Access Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your user's "Security Credentials" tab</li>
              <li>Click "Create Access Key"</li>
              <li>Choose "Application running outside AWS"</li>
              <li><strong>Save these credentials securely!</strong></li>
            </ol>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> You can only view the secret access key once. Save it immediately!
              </AlertDescription>
            </Alert>
            <Button onClick={() => markStepComplete(3)}>Access Keys Created</Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Update Environment File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2">Create/update your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file:</p>
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(envTemplate)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre>{envTemplate}</pre>
              </div>
            </div>
            <Alert>
              <AlertDescription>
                Replace the placeholder values with your actual AWS credentials from Step 3.
              </AlertDescription>
            </Alert>
            <Button onClick={() => markStepComplete(4)}>Environment Updated</Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Verify Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Restart your development server</li>
              <li>Go to Settings → API Settings</li>
              <li>Click "Test Connection"</li>
              <li>Verify you see a success message</li>
            </ol>
            <Button onClick={() => markStepComplete(5)}>Setup Complete!</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}