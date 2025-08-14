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
  private sesClient: SESClient | null = null;
  private readonly RESET_TOKENS_KEY = 'password_reset_tokens';

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

  private getResetTokens(): Map<string, ResetTokenData> {
    const stored = localStorage.getItem(this.RESET_TOKENS_KEY);
    if (!stored) return new Map();
    
    try {
      const tokenArray = JSON.parse(stored);
      return new Map(tokenArray);
    } catch {
      return new Map();
    }
  }

  private saveResetTokens(tokens: Map<string, ResetTokenData>): void {
    const tokenArray = Array.from(tokens.entries());
    localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify(tokenArray));
  }

  generateResetToken(email: string, userId: string): string {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    const tokens = this.getResetTokens();
    tokens.set(token, {
      token,
      email,
      expiresAt,
      userId
    });
    this.saveResetTokens(tokens);

    console.log(`🔑 Generated reset token for ${email}: ${token}`);
    console.log(`📅 Token expires at: ${new Date(expiresAt).toLocaleString()}`);
    return token;
  }

  validateResetToken(token: string): ResetTokenData | null {
    const tokens = this.getResetTokens();
    const tokenData = tokens.get(token);
    
    if (!tokenData) {
      console.log(`❌ Token not found: ${token}`);
      return null;
    }

    if (Date.now() > tokenData.expiresAt) {
      tokens.delete(token);
      this.saveResetTokens(tokens);
      console.log(`⏰ Token expired: ${token}`);
      return null;
    }

    console.log(`✅ Token valid: ${token} for user ${tokenData.email}`);
    return tokenData;
  }

  consumeResetToken(token: string): void {
    const tokens = this.getResetTokens();
    tokens.delete(token);
    this.saveResetTokens(tokens);
    console.log(`🗑️ Token consumed: ${token}`);
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
      console.log(`📧 AWS SES email sent to: ${emailTemplate.to}`);
      return true;
    } catch (error) {
      console.error('AWS SES Error:', error);
      return false;
    }
  }

  private async sendEmailMock(emailTemplate: EmailTemplate): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📧 Mock Email Sent:', {
        to: emailTemplate.to,
        subject: emailTemplate.subject,
        html: emailTemplate.html.substring(0, 200) + '...',
        text: emailTemplate.text.substring(0, 200) + '...'
      });
      
      // Extract reset URL from email content for easy access
      const resetUrlMatch = emailTemplate.html.match(/href="([^"]*reset-password[^"]*)"/);
      if (resetUrlMatch) {
        console.log('🔗 RESET LINK:', resetUrlMatch[1]);
        console.log('👆 Click this link to reset your password!');
      }
      
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
    
    console.log(`📨 Sending password reset email to: ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    
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
      console.warn('⚠️ AWS SES not configured, using mock email service');
      return await this.sendEmailMock(emailTemplate);
    }
  }

  async sendAccountApprovedEmail(email: string, name: string): Promise<boolean> {
    console.log(`📨 Sending account approved email to: ${email}`);
    
    const emailTemplate: EmailTemplate = {
      to: email,
      subject: 'Account Approved - Procurement System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Account Approved!</h2>
          <p>Hello ${name},</p>
          <p>Great news! Your account for the Procurement System has been approved by an administrator.</p>
          <p>You can now log in to your account using your email and password.</p>
          <a href="${window.location.origin}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Login Now</a>
          <p>Welcome to the Procurement System!</p>
        </div>
      `,
      text: `
        Account Approved!
        
        Hello ${name},
        
        Great news! Your account for the Procurement System has been approved by an administrator.
        
        You can now log in to your account using your email and password.
        
        Login at: ${window.location.origin}
        
        Welcome to the Procurement System!
      `
    };

    if (isAwsConfigured()) {
      return await this.sendEmailWithSES(emailTemplate);
    } else {
      console.warn('⚠️ AWS SES not configured, using mock email service');
      return await this.sendEmailMock(emailTemplate);
    }
  }

  async sendAccountRejectedEmail(email: string, name: string, reason?: string): Promise<boolean> {
    console.log(`📨 Sending account rejected email to: ${email}`);
    
    const reasonText = reason ? `\n\nReason: ${reason}` : '';
    
    const emailTemplate: EmailTemplate = {
      to: email,
      subject: 'Account Registration - Procurement System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Account Registration Update</h2>
          <p>Hello ${name},</p>
          <p>We regret to inform you that your account registration for the Procurement System has not been approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you believe this is an error or would like to discuss this decision, please contact your system administrator.</p>
          <p>Thank you for your interest in the Procurement System.</p>
        </div>
      `,
      text: `
        Account Registration Update
        
        Hello ${name},
        
        We regret to inform you that your account registration for the Procurement System has not been approved at this time.
        ${reasonText}
        
        If you believe this is an error or would like to discuss this decision, please contact your system administrator.
        
        Thank you for your interest in the Procurement System.
      `
    };

    if (isAwsConfigured()) {
      return await this.sendEmailWithSES(emailTemplate);
    } else {
      console.warn('⚠️ AWS SES not configured, using mock email service');
      return await this.sendEmailMock(emailTemplate);
    }
  }

  getSentEmails(): any[] {
    return JSON.parse(localStorage.getItem('demo_sent_emails') || '[]');
  }

  clearSentEmails(): void {
    localStorage.removeItem('demo_sent_emails');
  }

  // Debug method to check stored tokens
  debugTokens(): void {
    const tokens = this.getResetTokens();
    console.log('🔍 Stored reset tokens:', Array.from(tokens.entries()).map(([token, data]) => ({
      token: token.substring(0, 8) + '...',
      email: data.email,
      expiresAt: new Date(data.expiresAt).toLocaleString(),
      expired: Date.now() > data.expiresAt
    })));
  }
}

export const emailService = new EmailService();