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

interface CampaignApprovedProps {
  companyName: string;
  campaignName: string;
  impressions: number;
  dashboardUrl: string;
}

export default function CampaignApprovedEmail({
  companyName = "Your Company",
  campaignName = "Your Campaign",
  impressions = 10000,
  dashboardUrl = "https://nukk.nl/dashboard"
}: CampaignApprovedProps) {
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
            <Text style={tagline}>Campagne Goedgekeurd ✅</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h2}>Goed nieuws, {companyName}!</Heading>
            
            <Text style={text}>
              Je campagne <strong>"{campaignName}"</strong> is goedgekeurd en gaat nu live! 
              Je advertentie zal binnenkort getoond worden aan onze doelgroep van 
              kritische denkers en professionals.
            </Text>

            {/* Success box */}
            <Section style={successBox}>
              <div style={successIcon}>🎉</div>
              <Text style={successTitle}>Campagne Status: ACTIEF</Text>
              <Text style={successText}>
                Je advertentie is nu live en begint impressies te verzamelen
              </Text>
            </Section>

            {/* Campaign details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Campagne Details</Text>
              <div style={detailsGrid}>
                <div style={detailRow}>
                  <Text style={detailLabel}>Campagne naam:</Text>
                  <Text style={detailValue}>{campaignName}</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>Impressies gekocht:</Text>
                  <Text style={detailValue}>{formatNumber(impressions)}</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>Status:</Text>
                  <Text style={statusActive}>ACTIEF</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>Verwachte looptijd:</Text>
                  <Text style={detailValue}>2-4 weken</Text>
                </div>
              </div>
            </Section>

            {/* What happens next */}
            <Text style={subtitle}>Wat gebeurt er nu?</Text>

            <Section style={timelineBox}>
              <div style={timelineItem}>
                <div style={timelineDot}></div>
                <div style={timelineContent}>
                  <Text style={timelineTitle}>Nu - Advertentie rotatie gestart</Text>
                  <Text style={timelineText}>
                    Je advertentie wordt toegevoegd aan onze rotatie en begint impressies te verzamelen
                  </Text>
                </div>
              </div>

              <div style={timelineItem}>
                <div style={timelineDot}></div>
                <div style={timelineContent}>
                  <Text style={timelineTitle}>Over enkele uren - Eerste data</Text>
                  <Text style={timelineText}>
                    De eerste analytics verschijnen in je dashboard
                  </Text>
                </div>
              </div>

              <div style={timelineItem}>
                <div style={timelineDot}></div>
                <div style={timelineContent}>
                  <Text style={timelineTitle}>Doorlopend - Real-time tracking</Text>
                  <Text style={timelineText}>
                    Volg je impressies, clicks en performance live in het dashboard
                  </Text>
                </div>
              </div>
            </Section>

            <Section style={ctaSection}>
              <Button style={button} href={dashboardUrl}>
                Bekijk Live Analytics
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Tips for success */}
            <Text style={subtitle}>Tips voor Succes</Text>

            <Section style={tipsList}>
              <Text style={tipItem}>
                📊 <strong>Monitor je performance:</strong> Check je dashboard dagelijks voor de beste inzichten
              </Text>
              <Text style={tipItem}>
                ⏰ <strong>Timing is belangrijk:</strong> De meeste clicks komen tussen 9:00-11:00 en 15:00-17:00
              </Text>
              <Text style={tipItem}>
                🎯 <strong>Landing page optimalisatie:</strong> Zorg dat je website mobiel-vriendelijk is
              </Text>
              <Text style={tipItem}>
                💬 <strong>A/B test je content:</strong> Probeer verschillende versies voor betere resultaten
              </Text>
            </Section>

            {/* Support info */}
            <Section style={supportBox}>
              <Text style={supportTitle}>Hulp nodig?</Text>
              <Text style={supportText}>
                Ons team helpt je graag om het maximale uit je campagne te halen. 
                Neem contact op via{' '}
                <Link href="mailto:support@nukk.nl" style={link}>
                  support@nukk.nl
                </Link>{' '}
                of bekijk onze{' '}
                <Link href="https://nukk.nl/help/campaign-optimization" style={link}>
                  optimalisatie gids
                </Link>.
              </Text>
            </Section>

            <Text style={text}>
              Succes met je campagne! We kijken uit naar je resultaten.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              nukk.nl - Premium Advertising Platform<br />
              Campagne geactiveerd op {new Date().toLocaleDateString('nl-NL')}
            </Text>
            <Text style={footerText}>
              <Link href={dashboardUrl} style={footerLink}>
                Dashboard
              </Link>{' '}
              |{' '}
              <Link href="https://nukk.nl/help" style={footerLink}>
                Help Center
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

const successBox = {
  backgroundColor: '#dcfce7',
  border: '2px solid #22c55e',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
};

const successTitle = {
  color: '#166534',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const successText = {
  color: '#166534',
  fontSize: '14px',
  margin: '0',
};

const detailsBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const detailsTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const detailsGrid = {
  display: 'block',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  paddingBottom: '8px',
  borderBottom: '1px solid #e9ecef',
};

const detailLabel = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
  flex: '1',
};

const detailValue = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right' as const,
};

const statusActive = {
  color: '#22c55e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'right' as const,
};

const subtitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const timelineBox = {
  margin: '16px 0 24px',
};

const timelineItem = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '0 0 16px',
};

const timelineDot = {
  backgroundColor: '#22c55e',
  borderRadius: '50%',
  width: '12px',
  height: '12px',
  margin: '6px 16px 0 0',
  flexShrink: '0' as const,
};

const timelineContent = {
  flex: '1',
};

const timelineTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const timelineText = {
  color: '#666',
  fontSize: '13px',
  lineHeight: '1.4',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e9ecef',
  margin: '32px 0',
};

const tipsList = {
  margin: '16px 0',
};

const tipItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const supportBox = {
  backgroundColor: '#e6f3ff',
  border: '1px solid #b3d9ff',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const supportTitle = {
  color: '#0066cc',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const supportText = {
  color: '#004080',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
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