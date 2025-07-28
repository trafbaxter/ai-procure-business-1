import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, ExternalLink, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { emailService } from '@/services/emailService';
import { isAwsConfigured } from '@/config/aws';

const EmailDebugPanel = () => {
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const awsConfigured = isAwsConfigured();

  const loadEmails = () => {
    setSentEmails(emailService.getSentEmails());
  };

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearEmails = () => {
    emailService.clearSentEmails();
    setSentEmails([]);
  };

  const openResetLink = (resetToken: string) => {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    window.open(resetUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Service Status</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadEmails}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={clearEmails}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        <CardDescription>
          {awsConfigured ? 
            'AWS SES configured - emails will be sent via AWS' : 
            'AWS SES not configured - using mock email service'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!awsConfigured && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">AWS SES Not Configured</div>
              <div className="text-yellow-700">
                Set up AWS credentials in .env file to send real emails. 
                Currently using mock service for demonstration.
              </div>
            </div>
          </div>
        )}
        
        {sentEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No emails sent yet. Try using the "Forgot Password" feature.
          </div>
        ) : (
          <div className="space-y-4">
            {sentEmails.map((email, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{email.subject}</div>
                    <div className="text-sm text-muted-foreground">To: {email.to}</div>
                    <div className="text-xs text-muted-foreground">
                      Sent: {new Date(email.sentAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={awsConfigured ? "default" : "secondary"}>
                    {awsConfigured ? "AWS SES" : "Mock Email"}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="text-sm space-y-2">
                  <div dangerouslySetInnerHTML={{ __html: email.html }} />
                </div>
                {email.resetToken && (
                  <div className="mt-4 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openResetLink(email.resetToken)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Reset Link
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailDebugPanel;