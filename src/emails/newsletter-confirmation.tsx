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

interface NewsletterConfirmationProps {
  email: string;
  confirmUrl: string;
  unsubscribeUrl: string;
}

export default function NewsletterConfirmationEmail({
  email = "user@example.com",
  confirmUrl = "https://nukk.nl/confirm",
  unsubscribeUrl = "https://nukk.nl/unsubscribe"
}: NewsletterConfirmationProps) {
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
            <Heading style={h2}>Bevestig je nieuwsbrief aanmelding</Heading>
            
            <Text style={text}>
              Bedankt voor je interesse in de nukk.nl nieuwsbrief! Om je aanmelding 
              te voltooien en te beginnen met het ontvangen van onze wekelijkse 
              fact-check updates, klik je op de knop hieronder.
            </Text>

            {/* Email confirmation box */}
            <Section style={confirmBox}>
              <div style={confirmIcon}>📧</div>
              <Text style={confirmTitle}>E-mail Bevestiging Vereist</Text>
              <Text style={confirmEmail}>{email}</Text>
              <Text style={confirmText}>
                Klik op de knop om je aanmelding te bevestigen
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button style={button} href={confirmUrl}>
                Bevestig Aanmelding
              </Button>
            </Section>

            <Text style={text}>
              Als de knop niet werkt, kun je ook deze link kopiëren en plakken in je browser:
            </Text>
            <Text style={urlText}>{confirmUrl}</Text>

            <Hr style={hr} />

            {/* What to expect */}
            <Text style={subtitle}>Wat kun je verwachten?</Text>

            <Section style={expectationsList}>
              <div style={expectationItem}>
                <Text style={expectationTitle}>📊 Wekelijkse Fact-Check Roundup</Text>
                <Text style={expectationText}>
                  De meest interessante analyses van Nederlandse nieuwsartikelen
                </Text>
              </div>

              <div style={expectationItem}>
                <Text style={expectationTitle}>🔍 Platform Updates</Text>
                <Text style={expectationText}>
                  Nieuwe features, verbeteringen aan onze AI-algoritmes
                </Text>
              </div>

              <div style={expectationItem}>
                <Text style={expectationTitle}>📈 Trending Misinformatie</Text>
                <Text style={expectationText}>
                  Alerts over veelvoorkomende desinformatie trends
                </Text>
              </div>

              <div style={expectationItem}>
                <Text style={expectationTitle}>💡 Media Literacy Tips</Text>
                <Text style={expectationText}>
                  Praktische tips om zelf misleidende informatie te herkennen
                </Text>
              </div>
            </Section>

            {/* Privacy assurance */}
            <Section style={privacyBox}>
              <Text style={privacyTitle}>🔒 Je privacy is belangrijk voor ons</Text>
              <Text style={privacyText}>
                • We versturen maximaal 1 e-mail per week<br />
                • Je gegevens worden nooit gedeeld met derden<br />
                • Je kunt je altijd uitschrijven met één klik<br />
                • Alle e-mails zijn GDPR-compliant
              </Text>
            </Section>

            {/* Sample content */}
            <Text style={subtitle}>Voorbeeld van onze content:</Text>

            <Section style={sampleBox}>
              <Text style={sampleTitle}>Deze week ontdekt: Misleidende statistieken in energie debat</Text>
              <Text style={sampleText}>
                "Onze AI-analyse van 47 nieuwsartikelen over kernenergie toont aan dat 
                23% van de gepresenteerde statistieken misleidend geframd waren. 
                Lees meer over hoe je zelf dergelijke framing kunt herkennen..."
              </Text>
              <Text style={sampleMeta}>
                • 127 artikelen geanalyseerd • Gem. objectiviteit: 72% • 5 min. leestijd
              </Text>
            </Section>

            <Text style={text}>
              Heb je deze aanmelding niet gedaan? Dan kun je deze e-mail gewoon negeren. 
              Je ontvangt dan geen verdere e-mails van ons.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              nukk.nl - Premium Fact-Checking Platform<br />
              Nederland
            </Text>
            <Text style={footerText}>
              <Link href="https://nukk.nl/privacy" style={footerLink}>
                Privacy Policy
              </Link>{' '}
              |{' '}
              <Link href={unsubscribeUrl} style={footerLink}>
                Uitschrijven
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              Je ontvangt deze e-mail omdat je je hebt aangemeld voor de nukk.nl nieuwsbrief op {new Date().toLocaleDateString('nl-NL')}.
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

const confirmBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #0066cc',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const confirmIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
};

const confirmTitle = {
  color: '#0066cc',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const confirmEmail = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
  wordBreak: 'break-all' as const,
};

const confirmText = {
  color: '#0066cc',
  fontSize: '14px',
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

const urlText = {
  color: '#666',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
  backgroundColor: '#f8f9fa',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #e9ecef',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e9ecef',
  margin: '32px 0',
};

const subtitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const expectationsList = {
  margin: '16px 0',
};

const expectationItem = {
  margin: '0 0 16px',
};

const expectationTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const expectationText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0',
};

const privacyBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const privacyTitle = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const privacyText = {
  color: '#166534',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const sampleBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const sampleTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const sampleText = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
  fontStyle: 'italic',
};

const sampleMeta = {
  color: '#666',
  fontSize: '12px',
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

const footerDisclaimer = {
  color: '#999',
  fontSize: '11px',
  lineHeight: '1.3',
  margin: '16px 0 0',
};