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

interface WelcomeEmailProps {
  companyName: string;
  email: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({
  companyName = "Your Company",
  email = "user@example.com",
  dashboardUrl = "https://nukk.nl/dashboard"
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>nukk.nl</Heading>
            <Text style={tagline}>AI-powered fact-checking platform</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h2}>Welkom bij nukk.nl, {companyName}!</Heading>
            
            <Text style={text}>
              Bedankt voor je aanmelding bij nukk.nl, het premium platform voor 
              wallpaper advertenties die echt opvallen. Je account is succesvol aangemaakt 
              en je kunt nu beginnen met het maken van impactvolle campagnes.
            </Text>

            <Section style={infoBox}>
              <Text style={infoTitle}>Je Account Details:</Text>
              <Text style={infoText}>
                <strong>Bedrijf:</strong> {companyName}<br />
                <strong>E-mail:</strong> {email}
              </Text>
            </Section>

            <Text style={text}>
              <strong>Wat kun je nu doen?</strong>
            </Text>

            <Section style={features}>
              <Text style={featureItem}>
                ✅ Maak je eerste wallpaper advertentie campagne<br />
                ✅ Upload professionele advertentie afbeeldingen<br />
                ✅ Kies uit flexibele impressie pakketten<br />
                ✅ Bekijk real-time analytics van je campagnes<br />
                ✅ Bereik 50.000+ kritische denkers per maand
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button style={button} href={dashboardUrl}>
                Start je Eerste Campagne
              </Button>
            </Section>

            <Text style={text}>
              Heb je vragen? Ons team staat klaar om je te helpen. 
              Stuur een e-mail naar{' '}
              <Link href="mailto:support@nukk.nl" style={link}>
                support@nukk.nl
              </Link>{' '}
              of bekijk onze{' '}
              <Link href="https://nukk.nl/adverteren" style={link}>
                adverteerder gids
              </Link>.
            </Text>

            <Hr style={hr} />

            <Text style={subtitle}>
              Waarom adverteren op nukk.nl?
            </Text>

            <Section style={benefitsGrid}>
              <div style={benefitItem}>
                <Text style={benefitTitle}>🎯 Hoogopgeleid Publiek</Text>
                <Text style={benefitText}>
                  Bereik professionals die waarde hechten aan betrouwbare informatie
                </Text>
              </div>
              
              <div style={benefitItem}>
                <Text style={benefitTitle}>📊 Transparante Metrics</Text>
                <Text style={benefitText}>
                  Real-time analytics met impressies, clicks en engagement data
                </Text>
              </div>
              
              <div style={benefitItem}>
                <Text style={benefitTitle}>🚀 Hoge Impact</Text>
                <Text style={benefitText}>
                  Full-screen wallpaper ads met 5-7 seconden aandacht gegarandeerd
                </Text>
              </div>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              nukk.nl - Premium Advertising Platform<br />
              Nederland
            </Text>
            <Text style={footerText}>
              <Link href="https://nukk.nl/privacy" style={footerLink}>
                Privacy Policy
              </Link>{' '}
              |{' '}
              <Link href="https://nukk.nl/terms" style={footerLink}>
                Terms of Service
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
  color: '#666',
  fontSize: '14px',
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

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const infoTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const infoText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0',
};

const features = {
  margin: '16px 0',
};

const featureItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '1.6',
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
  padding: '12px 24px',
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

const benefitsGrid = {
  margin: '16px 0',
};

const benefitItem = {
  margin: '0 0 16px',
};

const benefitTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const benefitText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.4',
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