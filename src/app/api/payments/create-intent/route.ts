import { NextRequest, NextResponse } from 'next/server';
import { stripe, IMPRESSION_PACKAGES, PackageId } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { packageId, advertiserId, campaignId } = await request.json();

    // Validate package
    const packageData = IMPRESSION_PACKAGES[packageId as PackageId];
    if (!packageData) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      );
    }

    // Validate advertiser exists
    const { data: advertiser, error: advertiserError } = await supabase
      .from('advertisers')
      .select('id, email, company_name')
      .eq('id', advertiserId)
      .single();

    if (advertiserError || !advertiser) {
      return NextResponse.json(
        { error: 'Advertiser not found' },
        { status: 404 }
      );
    }

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate tax (21% VAT for Netherlands)
    const subtotalCents = packageData.priceInCents;
    const taxCents = Math.round(subtotalCents * 0.21);
    const totalCents = subtotalCents + taxCents;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      metadata: {
        packageId,
        advertiserId,
        campaignId: campaignId || '',
        impressions: packageData.impressions.toString(),
        invoiceNumber
      },
      description: `${packageData.name} - ${packageData.impressions.toLocaleString('nl-NL')} impressies voor ${advertiser.company_name}`,
      receipt_email: advertiser.email,
    });

    // Create invoice record in database
    const { error: invoiceError } = await supabase
      .from('ad_invoices')
      .insert({
        advertiser_id: advertiserId,
        campaign_id: campaignId || null,
        invoice_number: invoiceNumber,
        status: 'pending',
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: 'stripe',
        line_items: [
          {
            description: packageData.name,
            quantity: 1,
            unit_price_cents: subtotalCents,
            total_cents: subtotalCents,
            impressions: packageData.impressions
          }
        ],
        metadata: {
          package_id: packageId,
          stripe_payment_intent_id: paymentIntent.id
        }
      });

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      invoiceNumber,
      amount: totalCents,
      packageData: {
        ...packageData,
        subtotal: subtotalCents,
        tax: taxCents,
        total: totalCents
      }
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}