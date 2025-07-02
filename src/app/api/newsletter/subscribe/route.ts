import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Dit e-mailadres is al aangemeld' },
        { status: 409 }
      );
    }

    // Add new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        subscribed_at: new Date().toISOString(),
        status: 'pending', // Pending confirmation
        source: 'website'
      });

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      return NextResponse.json(
        { error: 'Aanmelding mislukt. Probeer het later opnieuw.' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation email
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - Amazon SES
    // - Resend

    return NextResponse.json({ 
      success: true,
      message: 'Succesvol aangemeld. Check je inbox voor bevestiging.'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}