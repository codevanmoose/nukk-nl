import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link
} from '@react-email/components';

interface PaymentConfirmationProps {
  companyName: string;
  invoiceNumber: string;
  amount: number; // in cents
  impressions: number;
  packageName: string;
  dashboardUrl: string;
}

export default function PaymentConfirmationEmail({
  companyName = "Your Company",
  invoiceNumber = "INV-123456",
  amount = 29900,
  impressions = 10000,
  packageName = "Starter Package",
  dashboardUrl = "https://nukk.nl/dashboard"
}: PaymentConfirmationProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nl-NL').format(num);
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>nukk.nl</Heading>
            <Text style={tagline}>Betaling Bevestigd ✅</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h2}>Bedankt voor je betaling, {companyName}!</Heading>
            
            <Text style={text}>
              Je betaling is succesvol verwerkt en je advertentie credits zijn toegevoegd 
              aan je account. Je kunt nu beginnen met het adverteren op nukk.nl!
            </Text>

            {/* Payment details */}
            <Section style={invoiceBox}>
              <Text style={invoiceTitle}>Betalingsdetails</Text>
              <div style={invoiceGrid}>
                <div style={invoiceRow}>
                  <Text style={invoiceLabel}>Factuurnummer:</Text>
                  <Text style={invoiceValue}>{invoiceNumber}</Text>
                </div>
                <div style={invoiceRow}>
                  <Text style={invoiceLabel}>Pakket:</Text>
                  <Text style={invoiceValue}>{packageName}</Text>
                </div>
                <div style={invoiceRow}>
                  <Text style={invoiceLabel}>Impressies:</Text>
                  <Text style={invoiceValue}>{formatNumber(impressions)}</Text>
                </div>
                <div style={invoiceRow}>
                  <Text style={invoiceLabel}>Bedrag:</Text>
                  <Text style={invoiceValueBold}>{formatCurrency(amount)}</Text>
                </div>
              </div>
            </Section>

            {/* Next steps */}
            <Text style={text}>
              <strong>Wat kun je nu doen?</strong>
            </Text>

            <Section style={stepsBox}>
              <div style={step}>
                <Text style={stepNumber}>1</Text>
                <div style={stepContent}>
                  <Text style={stepTitle}>Upload je Advertentie</Text>
                  <Text style={stepText}>
                    Maak een nieuwe campagne en upload je wallpaper advertentie afbeelding
                  </Text>
                </div>
              </div>

              <div style={step}>
                <Text style={stepNumber}>2</Text>
                <div style={stepContent}>
                  <Text style={stepTitle}>AI Goedkeuring</Text>
                  <Text style={stepText}>
                    Onze AI controleert je advertentie automatisch op kwaliteit en richtlijnen
                  </Text>
                </div>
              </div>

              <div style={step}>
                <Text style={stepNumber}>3</Text>
                <div style={stepContent}>
                  <Text style={stepTitle}>Live Campagne</Text>
                  <Text style={stepText}>
                    Je advertentie gaat live en begint impressies te verzamelen
                  </Text>
                </div>
              </div>
            </Section>

            <Section style={ctaSection}>
              <Button style={button} href={dashboardUrl}>
                Ga naar Dashboard
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Package benefits */}
            <Text style={subtitle}>
              Je {packageName} bevat:
            </Text>

            <Section style={benefitsList}>
              <Text style={benefitItem}>
                🎯 {formatNumber(impressions)} premium wallpaper impressies
              </Text>
              <Text style={benefitItem}>
                📊 Real-time analytics dashboard
              </Text>
              <Text style={benefitItem}>
                ⚡ AI-powered content moderatie
              </Text>
              <Text style={benefitItem}>
                📧 E-mail support tijdens kantooruren
              </Text>
              <Text style={benefitItem}>
                🔄 Campagne management tools
              </Text>
            </Section>

            {/* Important info */}
            <Section style={infoBox}>
              <Text style={infoTitle}>💡 Belangrijk om te weten:</Text>
              <Text style={infoText}>
                • Je impressies verlopen niet - gebruik ze wanneer je wilt<br />
                • Alle advertenties worden binnen 24 uur gecontroleerd<br />
                • Je kunt je campagnes altijd pauzeren en hervatten<br />
                • Analytics zijn real-time beschikbaar in je dashboard
              </Text>
            </Section>

            <Text style={text}>
              Heb je vragen over je betaling of advertentie campagne? 
              Ons support team helpt je graag verder via{' '}
              <Link href="mailto:support@nukk.nl" style={link}>
                support@nukk.nl
              </Link>.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              nukk.nl - Premium Advertising Platform<br />
              Factuur: {invoiceNumber} | Betaald op {new Date().toLocaleDateString('nl-NL')}
            </Text>
            <Text style={footerText}>
              <Link href={`${dashboardUrl}/billing`} style={footerLink}>
                Bekijk Factuurgeschiedenis
              </Link>{' '}
              |{' '}
              <Link href="mailto:billing@nukk.nl" style={footerLink}>
                Facturatie Vragen
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 32px 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#0066cc',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const tagline = {
  color: '#22c55e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 32px',
};

const content = {
  padding: '0 32px',
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px',
};

const invoiceBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #22c55e',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const invoiceTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const invoiceGrid = {
  display: 'block',
};

const invoiceRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  borderBottom: '1px solid #e9ecef',
  paddingBottom: '8px',
};

const invoiceLabel = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
  flex: '1',
};

const invoiceValue = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right' as const,
};

const invoiceValueBold = {
  color: '#22c55e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'right' as const,
};

const stepsBox = {
  margin: '24px 0',
};

const step = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '0 0 16px',
};

const stepNumber = {
  backgroundColor: '#0066cc',
  color: '#fff',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '0 12px 0 0',
  textAlign: 'center' as const,
  lineHeight: '24px',
};

const stepContent = {
  flex: '1',
};

const stepTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const stepText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0066cc',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e9ecef',
  margin: '32px 0',
};

const subtitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const benefitsList = {
  margin: '16px 0',
};

const benefitItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const infoBox = {
  backgroundColor: '#e6f3ff',
  border: '1px solid #b3d9ff',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#0066cc',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const infoText = {
  color: '#004080',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const footer = {
  borderTop: '1px solid #e9ecef',
  padding: '32px 32px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#666',
  textDecoration: 'underline',
};