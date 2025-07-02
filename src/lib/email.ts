import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
// import { render } from '@react-email/render';
// import WelcomeEmail from '../emails/welcome-email';
// import PaymentConfirmationEmail from '../emails/payment-confirmation';
// import CampaignApprovedEmail from '../emails/campaign-approved';
// import CampaignRejectedEmail from '../emails/campaign-rejected';
// import NewsletterConfirmationEmail from '../emails/newsletter-confirmation';

// AWS SES Client configuration
const sesClient = new SESClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export interface WelcomeEmailData {
  companyName: string;
  email: string;
  dashboardUrl: string;
}

export interface PaymentConfirmationData {
  companyName: string;
  invoiceNumber: string;
  amount: number;
  impressions: number;
  packageName: string;
  dashboardUrl: string;
}

export interface CampaignApprovedData {
  companyName: string;
  campaignName: string;
  impressions: number;
  dashboardUrl: string;
}

export interface CampaignRejectedData {
  companyName: string;
  campaignName: string;
  rejectionReason: string;
  guidelines: string[];
  dashboardUrl: string;
}

export interface NewsletterConfirmationData {
  email: string;
  confirmUrl: string;
  unsubscribeUrl: string;
}

class EmailService {
  private defaultFrom = 'nukk.nl <noreply@nukk.nl>';

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
      
      const command = new SendEmailCommand({
        Source: options.from || this.defaultFrom,
        Destination: {
          ToAddresses: toAddresses,
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: options.html,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const result = await sesClient.send(command);
      console.log('Email sent successfully via SES:', result.MessageId);
      return true;
    } catch (error) {
      console.error('Failed to send email via SES:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<boolean> {
    // const html = render(WelcomeEmail(data));
    const html = `<h1>Welkom bij nukk.nl - ${data.companyName}</h1><p>Email: ${data.email}</p><p><a href="${data.dashboardUrl}">Dashboard</a></p>`;
    
    return this.sendEmail({
      to,
      subject: `Welkom bij nukk.nl - ${data.companyName}`,
      html
    });
  }

  async sendPaymentConfirmation(to: string, data: PaymentConfirmationData): Promise<boolean> {
    const html = `<h1>Betaling Bevestigd</h1><p>Bedrag: €${(data.amount / 100).toFixed(2)}</p><p>Factuur: ${data.invoiceNumber}</p><p>Impressies: ${data.impressions}</p>`;
    
    return this.sendEmail({
      to,
      subject: `Betaling Bevestigd - €${(data.amount / 100).toFixed(2)} (${data.invoiceNumber})`,
      html
    });
  }

  async sendCampaignApproved(to: string, data: CampaignApprovedData): Promise<boolean> {
    const html = `<h1>Campagne Goedgekeurd</h1><p>Campagne: ${data.campaignName}</p><p>Impressies: ${data.impressions}</p>`;
    
    return this.sendEmail({
      to,
      subject: `✅ Campagne Goedgekeurd - ${data.campaignName}`,
      html
    });
  }

  async sendCampaignRejected(to: string, data: CampaignRejectedData): Promise<boolean> {
    const html = `<h1>Campagne Afgewezen</h1><p>Campagne: ${data.campaignName}</p><p>Reden: ${data.rejectionReason}</p>`;
    
    return this.sendEmail({
      to,
      subject: `❌ Campagne Afgewezen - ${data.campaignName}`,
      html
    });
  }

  async sendNewsletterConfirmation(to: string, data: NewsletterConfirmationData): Promise<boolean> {
    const html = `<h1>Bevestig nieuwsbrief</h1><p>Email: ${data.email}</p><p><a href="${data.confirmUrl}">Bevestigen</a></p>`;
    
    return this.sendEmail({
      to,
      subject: 'Bevestig je nieuwsbrief aanmelding - nukk.nl',
      html
    });
  }

  // Admin notification emails
  async sendModerationAlert(campaignId: string, advertiserEmail: string, moderationData: any): Promise<boolean> {
    const adminEmail = 'admin@nukk.nl'; // Replace with actual admin email
    
    return this.sendEmail({
      to: adminEmail,
      subject: `🔍 Moderation Required - Campaign ${campaignId}`,
      html: `
        <h2>Manual Moderation Required</h2>
        <p><strong>Campaign ID:</strong> ${campaignId}</p>
        <p><strong>Advertiser:</strong> ${advertiserEmail}</p>
        <p><strong>AI Score:</strong> ${moderationData.score}</p>
        <p><strong>Flags:</strong> ${moderationData.flags.join(', ')}</p>
        <p><strong>Reasoning:</strong> ${moderationData.reasoning}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/ads?campaign=${campaignId}">Review in Admin Dashboard</a></p>
      `,
      from: 'nukk.nl Moderation <moderation@nukk.nl>'
    });
  }

  // Bulk newsletter sending
  async sendNewsletter(
    recipients: string[], 
    subject: string, 
    htmlContent: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Send in batches to comply with SES rate limits (14 emails/sec by default)
    const batchSize = 10;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Send emails in parallel within batch
      const batchPromises = batch.map(async (recipient) => {
        try {
          const command = new SendEmailCommand({
            Source: 'nukk.nl Newsletter <newsletter@nukk.nl>',
            Destination: {
              ToAddresses: [recipient],
            },
            Message: {
              Subject: {
                Data: subject,
                Charset: 'UTF-8',
              },
              Body: {
                Html: {
                  Data: htmlContent,
                  Charset: 'UTF-8',
                },
              },
            },
          });

          await sesClient.send(command);
          return true;
        } catch (error) {
          console.error(`Failed to send newsletter to ${recipient}:`, error);
          return false;
        }
      });

      const results = await Promise.all(batchPromises);
      sent += results.filter(r => r).length;
      failed += results.filter(r => !r).length;

      // Rate limiting - wait between batches (SES allows ~14 emails/sec)
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { sent, failed };
  }
}

export const emailService = new EmailService();

// Utility functions
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('nl-NL').format(num);
}