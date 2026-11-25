import { env } from '../config/env';

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document';
    text?: string;
    [key: string]: any;
  }>;
}

export class WhatsAppService {
  private formatPhoneNumber(phone: string): string {
    // Strip non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If 10 digits (standard Indian mobile without country code), prefix with 91
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Send a freeform direct text WhatsApp message
   */
  async sendTextMessage(to: string, text: string): Promise<SendWhatsAppResult> {
    const formattedPhone = this.formatPhoneNumber(to);

    if (
      env.WHATSAPP_MOCK_MODE ||
      !env.WHATSAPP_PHONE_NUMBER_ID ||
      !env.WHATSAPP_ACCESS_TOKEN
    ) {
      const mockId = `mock_wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('\n-----------------------------------------------------------');
      console.log('💬 [WhatsAppService:MOCK] Simulated WhatsApp Text Dispatch');
      console.log(`   To:       +${formattedPhone} (original: ${to})`);
      console.log(`   Message:  ${text}`);
      console.log(`   WAMID:    ${mockId}`);
      console.log('-----------------------------------------------------------');
      return {
        success: true,
        messageId: mockId,
      };
    }

    try {
      const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: text,
          },
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || `HTTP ${response.status} from Meta WhatsApp API`;
        console.error('❌ [WhatsAppService] Error response from Meta Cloud API:', data);
        return {
          success: false,
          error: errorMsg,
        };
      }

      const wamid = data?.messages?.[0]?.id;
      return {
        success: true,
        messageId: wamid,
      };
    } catch (error: any) {
      console.error('❌ [WhatsAppService] Exception sending WhatsApp text:', error.message);
      return {
        success: false,
        error: error.message || 'WhatsApp transmission failed',
      };
    }
  }

  /**
   * Send a pre-approved Meta WhatsApp template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    parameters: string[] = [],
    languageCode = 'en'
  ): Promise<SendWhatsAppResult> {
    const formattedPhone = this.formatPhoneNumber(to);

    const components: WhatsAppTemplateComponent[] = [];
    if (parameters.length > 0) {
      components.push({
        type: 'body',
        parameters: parameters.map((param) => ({
          type: 'text',
          text: param,
        })),
      });
    }

    if (
      env.WHATSAPP_MOCK_MODE ||
      !env.WHATSAPP_PHONE_NUMBER_ID ||
      !env.WHATSAPP_ACCESS_TOKEN
    ) {
      const mockId = `mock_wamid_template_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('\n-----------------------------------------------------------');
      console.log('💬 [WhatsAppService:MOCK] Simulated WhatsApp Template Dispatch');
      console.log(`   To:         +${formattedPhone} (original: ${to})`);
      console.log(`   Template:   ${templateName} (${languageCode})`);
      console.log(`   Parameters: ${JSON.stringify(parameters)}`);
      console.log(`   WAMID:      ${mockId}`);
      console.log('-----------------------------------------------------------');
      return {
        success: true,
        messageId: mockId,
      };
    }

    try {
      const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components,
          },
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || `HTTP ${response.status} from Meta WhatsApp API`;
        console.error('❌ [WhatsAppService] Error response from Meta Cloud API:', data);
        return {
          success: false,
          error: errorMsg,
        };
      }

      const wamid = data?.messages?.[0]?.id;
      return {
        success: true,
        messageId: wamid,
      };
    } catch (error: any) {
      console.error('❌ [WhatsAppService] Exception sending WhatsApp template:', error.message);
      return {
        success: false,
        error: error.message || 'WhatsApp transmission failed',
      };
    }
  }

  /**
   * Helper: Send Registration Confirmation WhatsApp Alert
   */
  async sendRegistrationConfirmation(
    to: string,
    studentName: string,
    courseTitle: string,
    duration: string
  ): Promise<SendWhatsAppResult> {
    const formattedText = `🏎️ *2NOMADS Transportation Design Studio & Academy*

Hello *${studentName}*,

Thank you for applying to the *${courseTitle}* (${duration}) at 2NOMADS Academy in Pune!

Our senior design mentors will contact you shortly to review your portfolio and schedule your studio orientation.

📍 Studio: MSEI, Plot No. T-153/1 Bhosari, Pune
📞 Direct Studio Desk: +91 91582 28037
🌐 Website: 2nomads.design`;

    return this.sendTextMessage(to, formattedText);
  }
}

export const whatsappService = new WhatsAppService();
