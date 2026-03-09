// import { Injectable } from '@nestjs/common';
// import axios from 'axios';

// @Injectable()
// export class SmsService {
//   private apiKey = process.env.FAST2SMS_API_KEY;

//   async sendSms(phone: string, message: string): Promise<void> {
//     try {
//       const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
//         params: {
//           authorization: this.apiKey,
//           route: 'q',
//           message,
//           numbers: phone,
//           flash: '0',
//         },
//       });

//       if (!response.data.return) {
//         console.error('Fast2SMS Error:', response.data);
//         throw new Error(response.data.message || 'Failed to send SMS');
//       }

//       console.log('SMS sent successfully via Fast2SMS');
//     } catch (error) {
//       console.error(
//         'Fast2SMS Exception:',
//         error.response?.data || error.message,
//       );
//       throw new Error('Failed to send OTP via SMS');
//     }
//   }
// }

//removed because of videocon

import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private username = process.env.VIDEO_USERNAME;
  private apiKey = process.env.VIDEO_API_KEY;
  private senderId = process.env.VIDEO_SENDER_ID;
  private baseUrl = process.env.VIDEO_BASE_URL;
  private defaultTemplateId = process.env.VIDEO_DEFAULT_TEMPLATE_ID;

  async sendSms(
    mobile: string,
    message: string,
    templateId?: string,
  ): Promise<void> {
    const baseUrl = this.baseUrl?.trim();
    const isDev = process.env.NODE_ENV === 'development';

    if (!baseUrl || baseUrl === 'undefined' || baseUrl === '') {
      if (isDev) {
        console.log(
          `[SMS Dev Bypass] OTP for ${mobile}: ${message} (template: ${templateId || this.defaultTemplateId}). Set VIDEO_BASE_URL in .env to send real SMS.`,
        );
        return;
      }
      throw new Error(
        'SMS not configured. Set VIDEO_BASE_URL, VIDEO_USERNAME, VIDEO_API_KEY, VIDEO_SENDER_ID in .env',
      );
    }

    try {
      const params = {
        username: this.username,
        apikey: this.apiKey,
        senderid: this.senderId,
        mobile,
        message,
        templateid: templateId || this.defaultTemplateId,
      };

      const { data } = await axios.get(baseUrl, { params });

      console.log('Videocon SMS Response:', data, templateId);

      if (
        typeof data === 'string' &&
        (data.toLowerCase().includes('error') ||
          data.toLowerCase().includes('fail'))
      ) {
        throw new Error( 'Failed to send SMS via Videocon');
      }

      console.log('SMS sent successfully via Videocon');
    } catch (err: any) {
      const msg = err.response?.data || err.message;
      console.error('Videocon SMS Error:', msg);
      if (msg?.includes?.('Invalid URL') || msg?.includes?.('ECONNREFUSED')) {
        throw new Error(
          'SMS URL invalid or unreachable. Check VIDEO_BASE_URL in .env',
        );
      }
      throw new Error('Failed to send SMS via Videocon');
    }
  }
}
