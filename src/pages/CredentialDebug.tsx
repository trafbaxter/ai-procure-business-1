import { CredentialDiagnostic } from "@/components/CredentialDiagnostic";
import { AdvancedCredentialDiagnostic } from "@/components/AdvancedCredentialDiagnostic";
import { CredentialTestTool } from "@/components/CredentialTestTool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CredentialDebug() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AWS Credentials Debug</h1>
        <p className="text-muted-foreground">
          Diagnose AWS credential configuration issues
        </p>
      </div>
      
      <CredentialDiagnostic />
      
      <AdvancedCredentialDiagnostic />
      
      <CredentialTestTool />
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Create .env file</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Copy .env.example to .env in your project root:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              cp .env.example .env
            </code>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">2. Add your credentials</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Edit the .env file with your actual AWS credentials:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm whitespace-pre">
{`VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIA...
VITE_AWS_SECRET_ACCESS_KEY=...
VITE_SES_FROM_EMAIL=noreply@yourcompany.com`}
            </code>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">3. Restart development server</h3>
            <p className="text-sm text-muted-foreground">
              Stop your dev server (Ctrl+C) and restart it for changes to take effect.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}