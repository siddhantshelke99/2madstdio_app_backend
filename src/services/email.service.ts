import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface StudentRegistrationTemplateData {
  studentName: string;
  courseTitle: string;
  duration: string;
  mode: string;
  fee: number;
  registrationId: string;
  registeredAt: Date | string;
}

export interface AdminAlertTemplateData {
  alertType: 'student_registration' | 'studio_inquiry';
  subjectTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  secondaryInfo?: string;
  messageBody?: string;
  timestamp?: Date | string;
}

export interface CustomFollowUpTemplateData {
  recipientName: string;
  subjectTitle: string;
  messageBody: string;
  senderName?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (!env.SMTP_MOCK_MODE && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
        console.log(`📧 SMTP Transporter initialized (${env.SMTP_HOST}:${env.SMTP_PORT})`);
      } catch (err) {
        console.error('Failed to initialize live SMTP transporter:', err);
        this.transporter = null;
      }
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const fromAddress = options.from || env.SMTP_FROM;

    // Handle mock mode or unconfigured SMTP
    if (env.SMTP_MOCK_MODE || !this.transporter) {
      const mockId = `mock_mail_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('\n-----------------------------------------------------------');
      console.log('✉️  [EmailService:MOCK] Simulated Email Dispatch');
      console.log(`   To:      ${options.to}`);
      console.log(`   From:    ${fromAddress}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Msg ID:  ${mockId}`);
      console.log('-----------------------------------------------------------');
      return {
        success: true,
        messageId: mockId,
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error(`❌ [EmailService] Failed to send email to ${options.to}:`, error.message);
      return {
        success: false,
        error: error.message || 'SMTP transmission failure',
      };
    }
  }

  // --- HTML Email Templates ---

  /**
   * Template A: Student Registration Confirmation
   */
  renderStudentRegistrationConfirmation(data: StudentRegistrationTemplateData): string {
    const formattedFee = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(data.fee);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>2NOMADS — Application Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0c; color: #ececed; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #141518; border: 1px solid #27282d; border-radius: 8px; overflow: hidden; }
    .header { background-color: #080809; padding: 28px 32px; border-bottom: 2px solid #ff4d1c; }
    .kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #ff4d1c; font-weight: 700; margin: 0 0 6px 0; }
    .brand { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; margin: 0; }
    .content { padding: 32px; font-size: 15px; line-height: 1.7; color: #b8b9be; }
    .content h2 { color: #f5f5f7; font-size: 20px; font-weight: 600; margin-top: 0; }
    .info-card { background-color: #1a1b20; border: 1px solid #2d2e35; border-radius: 6px; padding: 20px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #26272e; padding-bottom: 8px; font-size: 14px; }
    .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .info-label { color: #7f818b; font-weight: 500; }
    .info-val { color: #ffffff; font-weight: 600; }
    .cta-btn { display: inline-block; background-color: #ff4d1c; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 4px; margin-top: 16px; }
    .footer { background-color: #0e0f11; padding: 24px 32px; font-size: 12px; color: #5c5d66; border-top: 1px solid #202126; }
    .footer a { color: #ff4d1c; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="kicker">Transportation Design Studio &amp; Academy</div>
      <div class="brand">2NOMADS</div>
    </div>
    <div class="content">
      <h2>Application Received, ${data.studentName}.</h2>
      <p>Thank you for registering your interest in joining 2NOMADS Academy. Our masterclasses and specialized courses are mentored directly by senior designers working with automotive OEMs.</p>
      
      <div class="info-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="color: #b8b9be; font-size: 14px;">
          <tr>
            <td style="color: #7f818b; width: 40%;">Course:</td>
            <td style="color: #ffffff; font-weight: 600;">${data.courseTitle}</td>
          </tr>
          <tr>
            <td style="color: #7f818b;">Mode:</td>
            <td style="color: #ffffff; font-weight: 600; text-transform: uppercase;">${data.mode}</td>
          </tr>
          <tr>
            <td style="color: #7f818b;">Duration:</td>
            <td style="color: #ffffff; font-weight: 600;">${data.duration}</td>
          </tr>
          <tr>
            <td style="color: #7f818b;">Tuition Fee:</td>
            <td style="color: #ffffff; font-weight: 600;">${formattedFee}</td>
          </tr>
          <tr>
            <td style="color: #7f818b;">Registration ID:</td>
            <td style="color: #ff4d1c; font-family: monospace; font-size: 13px;">${data.registrationId}</td>
          </tr>
        </table>
      </div>

      <p><strong>Next Steps:</strong></p>
      <p>A studio mentor or admissions counselor will review your application and reach out via phone or WhatsApp within 24 hours to schedule an introductory portfolio discussion and studio tour.</p>

      <p>If you have urgent questions, you can reply directly to this email or WhatsApp us at <strong>+91 91582 28037</strong>.</p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>2NOMADS Transportation Design Studio &amp; Academy</strong></p>
      <p style="margin: 0 0 6px 0;">MSEI, Plot No. T-153/1 Bhosari, Pune 411026, Maharashtra, India</p>
      <p style="margin: 0;">Email: <a href="mailto:donnykoren@gmail.com">donnykoren@gmail.com</a> | Phone: +91 91582 28037</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Template B: Admin Alert for New Registration or Studio Inquiry
   */
  renderAdminAlertNotification(data: AdminAlertTemplateData): string {
    const isRegistration = data.alertType === 'student_registration';
    const tag = isRegistration ? 'ACADEMY REGISTRATION' : 'STUDIO INQUIRY';
    const accentColor = isRegistration ? '#ff4d1c' : '#3b82f6';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>2NOMADS Alert: ${data.subjectTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0c; color: #ececed; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #141518; border: 1px solid #27282d; border-radius: 8px; overflow: hidden; }
    .header { background-color: #080809; padding: 20px 28px; border-bottom: 2px solid ${accentColor}; }
    .kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: ${accentColor}; font-weight: 700; margin: 0 0 4px 0; }
    .brand { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 28px; font-size: 15px; line-height: 1.6; color: #b8b9be; }
    .badge { display: inline-block; padding: 4px 10px; background-color: rgba(255, 77, 28, 0.15); color: ${accentColor}; font-size: 12px; font-weight: 700; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .card { background-color: #1a1b20; border: 1px solid #2d2e35; border-radius: 6px; padding: 18px; margin: 18px 0; }
    .message-box { background-color: #0f1013; border-left: 3px solid ${accentColor}; padding: 14px 16px; margin-top: 14px; font-style: italic; color: #d1d2d8; font-size: 14px; }
    .footer { background-color: #0e0f11; padding: 16px 28px; font-size: 12px; color: #5c5d66; border-top: 1px solid #202126; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="kicker">${tag}</div>
      <div class="brand">2NOMADS Admin Dispatch</div>
    </div>
    <div class="content">
      <div class="badge">${data.subjectTitle}</div>
      <p style="color: #ffffff; font-weight: 600; font-size: 17px; margin-top: 0;">New submission received on the website.</p>
      
      <div class="card">
        <table width="100%" cellpadding="6" cellspacing="0" style="color: #b8b9be; font-size: 14px;">
          <tr>
            <td style="color: #7f818b; width: 35%;">Name:</td>
            <td style="color: #ffffff; font-weight: 600;">${data.applicantName}</td>
          </tr>
          <tr>
            <td style="color: #7f818b;">Email:</td>
            <td style="color: #ffffff;"><a href="mailto:${data.applicantEmail}" style="color: #ff4d1c;">${data.applicantEmail}</a></td>
          </tr>
          <tr>
            <td style="color: #7f818b;">Phone:</td>
            <td style="color: #ffffff;"><a href="tel:${data.applicantPhone}" style="color: #ff4d1c;">${data.applicantPhone}</a></td>
          </tr>
          ${
            data.secondaryInfo
              ? `<tr>
            <td style="color: #7f818b;">Reference / Detail:</td>
            <td style="color: #ffffff;">${data.secondaryInfo}</td>
          </tr>`
              : ''
          }
        </table>

        ${
          data.messageBody
            ? `<div class="message-box">"${data.messageBody}"</div>`
            : ''
        }
      </div>

      <p style="font-size: 13px; color: #7f818b;">Log in to the 2NOMADS Admin Dashboard to update the status or trigger follow-up communications.</p>
    </div>
    <div class="footer">
      Automated internal notification system · 2NOMADS Design Studio &amp; Academy
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Template C: Custom Follow-up Email (Manual Admin Trigger)
   */
  renderCustomFollowUpEmail(data: CustomFollowUpTemplateData): string {
    const sender = data.senderName || '2NOMADS Admissions & Studio Team';
    const paragraphs = data.messageBody
      .split('\n')
      .filter((p) => p.trim().length > 0)
      .map((p) => `<p style="margin-bottom: 14px;">${p}</p>`)
      .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${data.subjectTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0c; color: #ececed; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #141518; border: 1px solid #27282d; border-radius: 8px; overflow: hidden; }
    .header { background-color: #080809; padding: 24px 32px; border-bottom: 2px solid #ff4d1c; }
    .kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #ff4d1c; font-weight: 700; margin: 0 0 6px 0; }
    .brand { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 32px; font-size: 15px; line-height: 1.7; color: #c5c6cc; }
    .content h2 { color: #f5f5f7; font-size: 19px; font-weight: 600; margin-top: 0; }
    .divider { height: 1px; background-color: #27282d; margin: 24px 0; }
    .signature { color: #8e909a; font-size: 14px; }
    .signature strong { color: #ffffff; }
    .footer { background-color: #0e0f11; padding: 24px 32px; font-size: 12px; color: #5c5d66; border-top: 1px solid #202126; }
    .footer a { color: #ff4d1c; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="kicker">Transportation Design Studio &amp; Academy</div>
      <div class="brand">2NOMADS</div>
    </div>
    <div class="content">
      <h2>Dear ${data.recipientName},</h2>
      ${paragraphs}
      <div class="divider"></div>
      <div class="signature">
        Warm regards,<br>
        <strong>${sender}</strong><br>
        2NOMADS Transportation Design Studio
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>2NOMADS Transportation Design Studio &amp; Academy</strong></p>
      <p style="margin: 0 0 4px 0;">Plot No. T-153/1 Bhosari, Pune 411026, Maharashtra, India</p>
      <p style="margin: 0;">Phone: +91 91582 28037 | Email: <a href="mailto:donnykoren@gmail.com">donnykoren@gmail.com</a></p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export const emailService = new EmailService();
