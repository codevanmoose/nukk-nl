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

interface CampaignRejectedProps {
  companyName: string;
  campaignName: string;
  rejectionReason: string;
  guidelines: string[];
  dashboardUrl: string;
}

export default function CampaignRejectedEmail({
  companyName = "Your Company",
  campaignName = "Your Campaign",
  rejectionReason = "Content does not meet our guidelines",
  guidelines = [
    "Ensure professional image quality",
    "Avoid misleading claims",
    "Use appropriate content for our audience"
  ],
  dashboardUrl = "https://nukk.nl/dashboard"
}: CampaignRejectedProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>nukk.nl</Heading>
            <Text style={tagline}>Campagne Review Resultaat</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h2}>Hallo {companyName},</Heading>
            
            <Text style={text}>
              We hebben je campagne <strong>"{campaignName}"</strong> beoordeeld, 
              maar helaas kunnen we deze niet goedkeuren in de huidige vorm. 
              We helpen je graag om de advertentie aan te passen zodat deze wel 
              kan worden goedgekeurd.
            </Text>

            {/* Rejection notice */}
            <Section style={rejectionBox}>
              <div style={rejectionIcon}>⚠️</div>
              <Text style={rejectionTitle}>Campagne Niet Goedgekeurd</Text>
              <Text style={rejectionText}>
                Je advertentie voldoet nog niet aan onze kwaliteitsstandaarden
              </Text>
            </Section>

            {/* Reason */}
            <Section style={reasonBox}>
              <Text style={reasonTitle}>Reden voor afwijzing:</Text>
              <Text style={reasonText}>{rejectionReason}</Text>
            </Section>

            {/* Guidelines */}
            <Text style={subtitle}>Om goedkeuring te krijgen, let op deze punten:</Text>

            <Section style={guidelinesList}>
              {guidelines.map((guideline, index) => (
                <Text key={index} style={guidelineItem}>
                  ✓ {guideline}
                </Text>
              ))}
            </Section>

            {/* What to do next */}
            <Section style={nextStepsBox}>
              <Text style={nextStepsTitle}>Wat kun je nu doen?</Text>
              
              <div style={stepItem}>
                <Text style={stepNumber}>1</Text>
                <div style={stepContent}>
                  <Text style={stepTitle}>Pas je advertentie aan</Text>
                  <Text style={stepText}>
                    Upload een nieuwe versie die voldoet aan onze richtlijnen
                  </Text>
                </div>
              </div>

              <div style={stepItem}>
                <Text style={stepNumber}>2</Text>
                <div style={stepContent}>
                  <Text style={stepTitle}>Automatische hercontrole</Text>
                  <Text style={stepText}>
                    Onze AI controleert je nieuwe versie direct opnieuw
                  </Text>
                </div>
              </div>

              <div style={stepItem}>
                <Text style={stepNumber}>3</Text>
                <div style={stepContent}>
                  <Text style={stepTitle}>Campagne gaat live</Text>
                  <Text style={stepText}>
                    Bij goedkeuring start je campagne automatisch
                  </Text>
                </div>
              </div>
            </Section>

            <Section style={ctaSection}>
              <Button style={button} href={`${dashboardUrl}/campaigns`}>
                Pas Advertentie Aan
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Guidelines reference */}
            <Text style={subtitle}>Onze Content Richtlijnen</Text>

            <Section style={guidelinesDetails}>
              <div style={guidelineCategory}>
                <Text style={categoryTitle}>🎨 Visuele Kwaliteit</Text>
                <Text style={categoryText}>
                  • Minimaal 1920x1080 resolutie<br />
                  • Professioneel ontwerp<br />
                  • Duidelijke, leesbare tekst<br />
                  • Geen pixelige of wazige afbeeldingen
                </Text>
              </div>

              <div style={guidelineCategory}>
                <Text style={categoryTitle}>📝 Content Standaarden</Text>
                <Text style={categoryText}>
                  • Geen misleidende claims<br />
                  • Respectvol en professioneel<br />
                  • Geschikt voor hoogopgeleid publiek<br />
                  • Geen adult content of geweld
                </Text>
              </div>

              <div style={guidelineCategory}>
                <Text style={categoryTitle}>⚖️ Juridische Vereisten</Text>
                <Text style={categoryText}>
                  • Respecteer auteursrechten<br />
                  • Geen inbreuk op handelsmerken<br />
                  • Voldoe aan Nederlandse reclame wetgeving<br />
                  • Duidelijke advertentie-identificatie
                </Text>
              </div>
            </Section>

            {/* Support offer */}
            <Section style={supportBox}>
              <Text style={supportTitle}>Hulp nodig bij het aanpassen?</Text>
              <Text style={supportText}>
                Ons team helpt je graag om je advertentie klaar te maken voor goedkeuring. 
                We kunnen je voorzien van feedback en tips voor optimale resultaten.
              </Text>
              <Section style={supportActions}>
                <Link href="mailto:support@nukk.nl" style={supportLink}>
                  📧 E-mail Support
                </Link>
                <Link href="https://nukk.nl/adverteren/guidelines" style={supportLink}>
                  📋 Volledige Richtlijnen
                </Link>
                <Link href="https://nukk.nl/adverteren/examples" style={supportLink}>
                  ✨ Voorbeelden
                </Link>
              </Section>
            </Section>

            <Text style={text}>
              We kijken uit naar je aangepaste advertentie! De meeste aanpassingen 
              zijn klein en de hercontrole gebeurt meestal binnen een paar minuten.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              nukk.nl - Premium Advertising Platform<br />
              Review uitgevoerd op {new Date().toLocaleDateString('nl-NL')}
            </Text>
            <Text style={footerText}>
              <Link href={dashboardUrl} style={footerLink}>
                Dashboard
              </Link>{' '}
              |{' '}
              <Link href="mailto:support@nukk.nl" style={footerLink}>
                Support
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

const rejectionBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #f87171',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const rejectionIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
};

const rejectionTitle = {
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const rejectionText = {
  color: '#dc2626',
  fontSize: '14px',
  margin: '0',
};

const reasonBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const reasonTitle = {
  color: '#ea580c',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const reasonText = {
  color: '#9a3412',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0',
  fontStyle: 'italic',
};

const subtitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const guidelinesList = {
  margin: '16px 0',
};

const guidelineItem = {
  color: '#059669',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  fontWeight: '500',
};

const nextStepsBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const nextStepsTitle = {
  color: '#0369a1',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '0 0 12px',
};

const stepNumber = {
  backgroundColor: '#0066cc',
  color: '#fff',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '0 12px 0 0',
  textAlign: 'center' as const,
  lineHeight: '20px',
  flexShrink: '0' as const,
};

const stepContent = {
  flex: '1',
};

const stepTitle = {
  color: '#0369a1',
  fontSize: '13px',
  fontWeight: 'bold',
  margin: '0 0 2px',
};

const stepText = {
  color: '#075985',
  fontSize: '12px',
  lineHeight: '1.3',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
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

const guidelinesDetails = {
  margin: '16px 0',
};

const guidelineCategory = {
  margin: '0 0 20px',
};

const categoryTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const categoryText = {
  color: '#666',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const supportBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const supportTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const supportText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px',
};

const supportActions = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '8px',
};

const supportLink = {
  color: '#059669',
  fontSize: '13px',
  fontWeight: '500',
  textDecoration: 'underline',
  display: 'block',
  padding: '4px 0',
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