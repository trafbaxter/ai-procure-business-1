import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { AWS_CONFIG, isAwsConfigured } from '../config/aws';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface ResetTokenData {
  token: string;
  email: string;
  expiresAt: number;
  userId: string;
}

class EmailService {
  private resetTokens: Map<string, ResetTokenData> = new Map();
  private sesClient: SESClient | null = null;

  constructor() {
    if (isAwsConfigured()) {
      this.sesClient = new SESClient({
        region: AWS_CONFIG.region,
        credentials: {
          accessKeyId: AWS_CONFIG.accessKeyId,
          secretAccessKey: AWS_CONFIG.secretAccessKey,
        },
      });
    }
  }

  generateResetToken(email: string, userId: string): string {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    this.resetTokens.set(token, {
      token,
      email,
      expiresAt,
      userId
    });

    return token;
  }

  validateResetToken(token: string): ResetTokenData | null {
    const tokenData = this.resetTokens.get(token);
    
    if (!tokenData) {
      return null;
    }

    if (Date.now() > tokenData.expiresAt) {
      this.resetTokens.delete(token);
      return null;
    }

    return tokenData;
  }

  consumeResetToken(token: string): void {
    this.resetTokens.delete(token);
  }

  private async sendEmailWithSES(emailTemplate: EmailTemplate): Promise<boolean> {
    if (!this.sesClient) {
      throw new Error('AWS SES not configured');
    }

    try {
      const command = new SendEmailCommand({
        Source: `${AWS_CONFIG.sesFromName} <${AWS_CONFIG.sesFromEmail}>`,
        Destination: {
          ToAddresses: [emailTemplate.to],
        },
        Message: {
          Subject: {
            Data: emailTemplate.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: emailTemplate.html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: emailTemplate.text,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      return true;
    } catch (error) {
      console.error('AWS SES Error:', error);
      return false;
    }
  }

  private async sendEmailMock(emailTemplate: EmailTemplate): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📧 Mock Email Sent:', emailTemplate);
      
      const sentEmails = JSON.parse(localStorage.getItem('demo_sent_emails') || '[]');
      sentEmails.push({
        ...emailTemplate,
        sentAt: new Date().toISOString(),
      });
      localStorage.setItem('demo_sent_emails', JSON.stringify(sentEmails));

      return true;
    } catch (error) {
      console.error('Failed to send mock email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    const emailTemplate: EmailTemplate = {
      to: email,
      subject: 'Reset Your Password - Procurement System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password for the Procurement System.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      `,
      text: `
        Password Reset Request
        
        You requested to reset your password for the Procurement System.
        
        Click this link to reset your password: ${resetUrl}
        
        This link will expire in 24 hours.
        
        If you didn't request this reset, please ignore this email.
      `
    };

    // Use AWS SES if configured, otherwise fall back to mock
    if (isAwsConfigured()) {
      return await this.sendEmailWithSES(emailTemplate);
    } else {
      console.warn('AWS SES not configured, using mock email service');
      return await this.sendEmailMock(emailTemplate);
    }
  }

  getSentEmails(): any[] {
    return JSON.parse(localStorage.getItem('demo_sent_emails') || '[]');
  }

  clearSentEmails(): void {
    localStorage.removeItem('demo_sent_emails');
  }
}

export const emailService = new EmailService();