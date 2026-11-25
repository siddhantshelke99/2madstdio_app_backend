import { communicationLogRepository, CommunicationLogFilterOptions } from '../repositories/communication-log.repository';
import { studentRepository } from '../repositories/student.repository';
import { inquiryRepository } from '../repositories/inquiry.repository';
import { emailService } from './email.service';
import { whatsappService } from './whatsapp.service';
import { CommunicationLog } from '../models/CommunicationLog';
import { Student } from '../models/Student';
import { Inquiry } from '../models/Inquiry';
import { PaginatedResult } from '../repositories/base.repository';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { SendCommunicationInput } from '../validations/communication.validation';
import { env } from '../config/env';

export class CommunicationService {
  /**
   * Asynchronously trigger automated Email and WhatsApp alerts for new student registrations
   */
  async triggerStudentRegistrationCommunications(student: Student): Promise<void> {
    try {
      const studentDetails = await studentRepository.findById(student.id);
      if (!studentDetails) return;

      const courseTitle = studentDetails.course?.title || 'Selected Academy Course';
      const duration = studentDetails.course?.duration || 'Course Program';
      const fee = studentDetails.course?.fee || 0;
      const mode = studentDetails.course?.mode || 'offline';

      // 1. Email to Student
      try {
        const studentHtml = emailService.renderStudentRegistrationConfirmation({
          studentName: studentDetails.fullName,
          courseTitle,
          duration,
          mode,
          fee,
          registrationId: studentDetails.id,
          registeredAt: studentDetails.registeredAt,
        });

        const emailResult = await emailService.sendEmail({
          to: studentDetails.email,
          subject: `Application Confirmed: ${courseTitle} — 2NOMADS Academy`,
          html: studentHtml,
        });

        await communicationLogRepository.create({
          recipientType: 'student',
          recipientId: studentDetails.id,
          channel: 'email',
          templateName: 'student_registration_confirmation',
          payload: {
            recipientEmail: studentDetails.email,
            courseTitle,
            messageId: emailResult.messageId,
          },
          status: emailResult.success ? 'sent' : 'failed',
          errorMessage: emailResult.error || null,
        });
      } catch (err: any) {
        console.error('Error sending student confirmation email:', err);
        await communicationLogRepository.create({
          recipientType: 'student',
          recipientId: studentDetails.id,
          channel: 'email',
          templateName: 'student_registration_confirmation',
          payload: { recipientEmail: studentDetails.email },
          status: 'failed',
          errorMessage: err.message,
        });
      }

      // 2. WhatsApp to Student
      const targetPhone = studentDetails.whatsappNumber || studentDetails.phone;
      if (targetPhone) {
        try {
          const waResult = await whatsappService.sendRegistrationConfirmation(
            targetPhone,
            studentDetails.fullName,
            courseTitle,
            duration
          );

          await communicationLogRepository.create({
            recipientType: 'student',
            recipientId: studentDetails.id,
            channel: 'whatsapp',
            templateName: 'student_registration_confirmation_wa',
            payload: {
              targetPhone,
              courseTitle,
              wamid: waResult.messageId,
            },
            status: waResult.success ? 'sent' : 'failed',
            errorMessage: waResult.error || null,
          });
        } catch (err: any) {
          console.error('Error sending student confirmation WhatsApp:', err);
          await communicationLogRepository.create({
            recipientType: 'student',
            recipientId: studentDetails.id,
            channel: 'whatsapp',
            templateName: 'student_registration_confirmation_wa',
            payload: { targetPhone },
            status: 'failed',
            errorMessage: err.message,
          });
        }
      }

      // 3. Admin Notification Email
      try {
        const adminHtml = emailService.renderAdminAlertNotification({
          alertType: 'student_registration',
          subjectTitle: `New Academy Applicant: ${studentDetails.fullName}`,
          applicantName: studentDetails.fullName,
          applicantEmail: studentDetails.email,
          applicantPhone: studentDetails.phone,
          secondaryInfo: `Course: ${courseTitle} (${duration}) | Mode: ${mode}`,
          messageBody: studentDetails.notes || 'Registered through public academy portal.',
        });

        await emailService.sendEmail({
          to: env.ADMIN_NOTIFICATION_EMAIL,
          subject: `[2NOMADS Alert] New Student Application: ${studentDetails.fullName} (${courseTitle})`,
          html: adminHtml,
        });
      } catch (adminEmailErr) {
        console.warn('Could not dispatch admin registration alert email:', adminEmailErr);
      }
    } catch (globalErr) {
      console.error('Unexpected error in triggerStudentRegistrationCommunications:', globalErr);
    }
  }

  /**
   * Asynchronously trigger automated Admin & Submitter alerts for contact inquiries
   */
  async triggerInquiryCommunications(inquiry: Inquiry): Promise<void> {
    try {
      // 1. Admin Alert Email
      const adminHtml = emailService.renderAdminAlertNotification({
        alertType: 'studio_inquiry',
        subjectTitle: `New ${inquiry.type === 'studio_project' ? 'Studio Project RFP' : 'Academy General Inquiry'}`,
        applicantName: inquiry.name,
        applicantEmail: inquiry.email,
        applicantPhone: inquiry.phone,
        secondaryInfo: `Type: ${inquiry.type.toUpperCase()}`,
        messageBody: inquiry.message,
      });

      await emailService.sendEmail({
        to: env.ADMIN_NOTIFICATION_EMAIL,
        subject: `[2NOMADS Alert] New Inquiry from ${inquiry.name} (${inquiry.type})`,
        html: adminHtml,
      });

      // 2. Client Confirmation Email
      const clientHtml = emailService.renderCustomFollowUpEmail({
        recipientName: inquiry.name,
        subjectTitle: 'We received your inquiry — 2NOMADS Design Studio',
        messageBody: `Thank you for contacting 2NOMADS. We have received your inquiry regarding "${inquiry.type === 'studio_project' ? 'Studio OEM Design Services' : 'Academy Courses'}".\n\nOur team has reviewed your note:\n"${inquiry.message}"\n\nA design lead will get back to you shortly.`,
      });

      const clientEmailResult = await emailService.sendEmail({
        to: inquiry.email,
        subject: 'Inquiry Received — 2NOMADS Design Studio & Academy',
        html: clientHtml,
      });

      await communicationLogRepository.create({
        recipientType: 'inquiry',
        recipientId: inquiry.id,
        channel: 'email',
        templateName: 'inquiry_received_ack',
        payload: {
          clientEmail: inquiry.email,
          type: inquiry.type,
          messageId: clientEmailResult.messageId,
        },
        status: clientEmailResult.success ? 'sent' : 'failed',
        errorMessage: clientEmailResult.error || null,
      });
    } catch (err) {
      console.error('Error dispatching inquiry communications:', err);
    }
  }

  /**
   * Admin-driven manual dispatch of email or WhatsApp message
   */
  async sendManualCommunication(
    input: SendCommunicationInput,
    senderAdminName?: string
  ): Promise<{
    success: boolean;
    log: CommunicationLog;
    messageId?: string;
    error?: string;
  }> {
    let recipientName = '';
    let targetEmail = '';
    let targetPhone = '';

    if (input.recipientType === 'student') {
      const student = await studentRepository.findById(input.recipientId);
      if (!student) {
        throw new NotFoundError(`Student with ID "${input.recipientId}" was not found`);
      }
      recipientName = student.fullName;
      targetEmail = student.email;
      targetPhone = student.whatsappNumber || student.phone;
    } else if (input.recipientType === 'inquiry') {
      const inquiry = await inquiryRepository.findById(input.recipientId);
      if (!inquiry) {
        throw new NotFoundError(`Inquiry with ID "${input.recipientId}" was not found`);
      }
      recipientName = inquiry.name;
      targetEmail = inquiry.email;
      targetPhone = inquiry.phone;
    }

    let dispatchSuccess = false;
    let messageId: string | undefined;
    let errorMessage: string | null = null;

    if (input.channel === 'email') {
      if (!targetEmail) {
        throw new BadRequestError('Recipient does not have a valid email address');
      }

      const emailHtml = emailService.renderCustomFollowUpEmail({
        recipientName,
        subjectTitle: input.subject || 'Follow-up from 2NOMADS Studio & Academy',
        messageBody: input.message,
        senderName: senderAdminName,
      });

      const emailResult = await emailService.sendEmail({
        to: targetEmail,
        subject: input.subject!,
        html: emailHtml,
      });

      dispatchSuccess = emailResult.success;
      messageId = emailResult.messageId;
      errorMessage = emailResult.error || null;
    } else if (input.channel === 'whatsapp') {
      if (!targetPhone) {
        throw new BadRequestError('Recipient does not have a valid phone/WhatsApp number');
      }

      const waResult = await whatsappService.sendTextMessage(targetPhone, input.message);
      dispatchSuccess = waResult.success;
      messageId = waResult.messageId;
      errorMessage = waResult.error || null;
    }

    // Record in CommunicationLog table
    const log = await communicationLogRepository.create({
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      channel: input.channel,
      templateName: input.templateName || 'custom_admin_followup',
      payload: {
        recipientName,
        target: input.channel === 'email' ? targetEmail : targetPhone,
        subject: input.subject,
        message: input.message,
        messageId,
        dispatchedBy: senderAdminName || 'Admin',
      },
      status: dispatchSuccess ? 'sent' : 'failed',
      errorMessage,
      sentAt: new Date(),
    });

    return {
      success: dispatchSuccess,
      log,
      messageId,
      error: errorMessage || undefined,
    };
  }

  /**
   * Fetch paginated communication history logs
   */
  async getLogs(options: CommunicationLogFilterOptions): Promise<PaginatedResult<CommunicationLog>> {
    return communicationLogRepository.findAll(options);
  }
}

export const communicationService = new CommunicationService();
