import { NextRequest, NextResponse } from 'next/server';
import { stripe, WEBHOOK_EVENTS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentSuccess(event.data.object);
        break;

      case WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentFailure(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const {
    id: paymentIntentId,
    metadata: { advertiserId, campaignId, packageId, impressions, invoiceNumber }
  } = paymentIntent;

  console.log(`Payment succeeded for advertiser ${advertiserId}, package ${packageId}`);

  // Update invoice status
  const { error: invoiceUpdateError } = await supabase
    .from('ad_invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (invoiceUpdateError) {
    console.error('Error updating invoice:', invoiceUpdateError);
    return;
  }

  // Add credits to advertiser account
  const { error: creditsError } = await supabase
    .from('advertiser_credits')
    .insert({
      advertiser_id: advertiserId,
      amount_cents: paymentIntent.amount,
      type: 'purchase',
      description: `Payment received for ${Number(impressions).toLocaleString('nl-NL')} impressions (Invoice: ${invoiceNumber})`,
      invoice_id: await getInvoiceId(paymentIntentId)
    });

  if (creditsError) {
    console.error('Error adding credits:', creditsError);
    return;
  }

  // If there's a campaign, update it with purchased impressions
  if (campaignId) {
    const { error: campaignUpdateError } = await supabase
      .from('campaigns')
      .update({
        impressions_purchased: Number(impressions),
        status: 'approved', // Auto-approve after payment
        budget_cents: paymentIntent.amount,
        cost_per_impression_cents: Math.round(paymentIntent.amount / Number(impressions))
      })
      .eq('id', campaignId);

    if (campaignUpdateError) {
      console.error('Error updating campaign:', campaignUpdateError);
    }
  }

  // Send confirmation email (implement this later)
  await sendPaymentConfirmationEmail(advertiserId, {
    invoiceNumber,
    amount: paymentIntent.amount,
    impressions: Number(impressions),
    packageId
  });
}

async function handlePaymentFailure(paymentIntent: any) {
  const { id: paymentIntentId } = paymentIntent;

  console.log(`Payment failed for payment intent ${paymentIntentId}`);

  // Update invoice status
  const { error: invoiceUpdateError } = await supabase
    .from('ad_invoices')
    .update({
      status: 'failed'
    })
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (invoiceUpdateError) {
    console.error('Error updating failed invoice:', invoiceUpdateError);
  }

  // Send payment failure email (implement this later)
  // await sendPaymentFailureEmail(advertiserId, paymentIntent);
}

async function getInvoiceId(paymentIntentId: string): Promise<string | null> {
  const { data: invoice } = await supabase
    .from('ad_invoices')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  return invoice?.id || null;
}

async function sendPaymentConfirmationEmail(
  advertiserId: string, 
  details: {
    invoiceNumber: string;
    amount: number;
    impressions: number;
    packageId: string;
  }
) {
  // TODO: Implement email sending
  // This would integrate with your email service (Resend, SendGrid, etc.)
  
  console.log(`Should send confirmation email for advertiser ${advertiserId}:`, details);
  
  // Example implementation:
  /*
  const { data: advertiser } = await supabase
    .from('advertisers')
    .select('email, company_name')
    .eq('id', advertiserId)
    .single();

  if (advertiser) {
    await emailService.send({
      to: advertiser.email,
      template: 'payment-confirmation',
      data: {
        companyName: advertiser.company_name,
        ...details,
        amountFormatted: (details.amount / 100).toFixed(2)
      }
    });
  }
  */
}