import nodemailer from 'nodemailer';
import { config } from '../config';
import { EmailData } from '../types/auth';
import { BadRequestError } from '../errors/AppError';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  // Initialize email transporter
  private static async getTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporter) {
      return this.transporter;
    }

    // Check if email credentials are provided
    if (!config.email.user || !config.email.pass) {
      console.log('⚠️ Email credentials not provided, email service disabled');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });

    // Verify connection
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      console.log('⚠️ Email service disabled, continuing without email functionality');
      this.transporter = null;
      return null;
    }

    return this.transporter;
  }

  // Send email
  static async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      if (!transporter) {
        console.log('⚠️ Email service not available, skipping email send');
        return;
      }
      
      const mailOptions = {
        from: `"Twitter Clone" <${config.email.user}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, '')
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${emailData.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw error, just log it and continue
      console.log('⚠️ Email sending failed, but continuing with operation');
    }
  }

  // Send OTP email
  static async sendOTPEmail(email: string, otp: string, username: string): Promise<void> {
    const subject = 'Password Reset OTP - Twitter Clone';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1DA1F2; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Twitter Clone</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. Use the following OTP to complete the process:
          </p>
          
          <div style="background-color: #fff; border: 2px solid #1DA1F2; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #1DA1F2; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">
              ${otp}
            </h1>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            <strong>Important:</strong>
          </p>
          <ul style="color: #666; line-height: 1.6;">
            <li>This OTP is valid for 10 minutes only</li>
            <li>Do not share this OTP with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Twitter Clone Team
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  // Send welcome email
  static async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const subject = 'Welcome to Twitter Clone!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1DA1F2; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Twitter Clone</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Twitter Clone!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to Twitter Clone! Your account has been successfully created and you're now ready to start sharing your thoughts with the world.
          </p>
          
          <div style="background-color: #fff; border: 2px solid #1DA1F2; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h3 style="color: #1DA1F2; margin: 0;">Get Started</h3>
            <p style="color: #666; margin: 10px 0 0 0;">
              Start tweeting, following others, and engaging with the community!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions or need assistance, feel free to reach out to our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Happy tweeting!<br>
            The Twitter Clone Team
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  // Send password changed notification
  static async sendPasswordChangedEmail(email: string, username: string): Promise<void> {
    const subject = 'Password Changed - Twitter Clone';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1DA1F2; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Twitter Clone</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Successfully Changed</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Your password has been successfully changed. If you made this change, you can safely ignore this email.
          </p>
          
          <div style="background-color: #fff; border: 2px solid #28a745; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h3 style="color: #28a745; margin: 0;">✅ Password Updated</h3>
            <p style="color: #666; margin: 10px 0 0 0;">
              Your account is now secured with your new password.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            <strong>Security Tip:</strong> If you didn't change your password, please contact our support team immediately.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Twitter Clone Team
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html
    });
  }
} 