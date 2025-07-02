import { Resend } from 'resend';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/welcome-email';
import PaymentConfirmationEmail from '@/emails/payment-confirmation';
import CampaignApprovedEmail from '@/emails/campaign-approved';
import CampaignRejectedEmail from '@/emails/campaign-rejected';
import NewsletterConfirmationEmail from '@/emails/newsletter-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      const result = await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html
      });

      if (result.error) {
        console.error('Email send error:', result.error);
        return false;
      }

      console.log('Email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<boolean> {
    const html = render(WelcomeEmail(data));
    
    return this.sendEmail({
      to,
      subject: `Welkom bij nukk.nl - ${data.companyName}`,
      html
    });
  }

  async sendPaymentConfirmation(to: string, data: PaymentConfirmationData): Promise<boolean> {
    const html = render(PaymentConfirmationEmail(data));
    
    return this.sendEmail({
      to,
      subject: `Betaling Bevestigd - €${(data.amount / 100).toFixed(2)} (${data.invoiceNumber})`,
      html
    });
  }

  async sendCampaignApproved(to: string, data: CampaignApprovedData): Promise<boolean> {
    const html = render(CampaignApprovedEmail(data));
    
    return this.sendEmail({
      to,
      subject: `✅ Campagne Goedgekeurd - ${data.campaignName}`,
      html
    });
  }

  async sendCampaignRejected(to: string, data: CampaignRejectedData): Promise<boolean> {
    const html = render(CampaignRejectedEmail(data));
    
    return this.sendEmail({
      to,
      subject: `❌ Campagne Afgewezen - ${data.campaignName}`,
      html
    });
  }

  async sendNewsletterConfirmation(to: string, data: NewsletterConfirmationData): Promise<boolean> {
    const html = render(NewsletterConfirmationEmail(data));
    
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

    // Send in batches to avoid rate limits
    const batchSize = 50;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        const result = await resend.emails.send({
          from: 'nukk.nl Newsletter <newsletter@nukk.nl>',
          to: batch,
          subject,
          html: htmlContent
        });

        if (result.error) {
          console.error('Batch email error:', result.error);
          failed += batch.length;
        } else {
          sent += batch.length;
        }
      } catch (error) {
        console.error('Failed to send batch:', error);
        failed += batch.length;
      }

      // Rate limiting - wait between batches
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