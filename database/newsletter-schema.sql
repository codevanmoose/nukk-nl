-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'website',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- Newsletter campaigns table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  preview_text TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  stats JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter opens tracking
CREATE TABLE IF NOT EXISTS newsletter_opens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES newsletter_campaigns(id),
  subscriber_id UUID REFERENCES newsletter_subscribers(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Newsletter clicks tracking
CREATE TABLE IF NOT EXISTS newsletter_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES newsletter_campaigns(id),
  subscriber_id UUID REFERENCES newsletter_subscribers(id),
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for newsletter_subscribers
-- Only allow inserts with email (public can subscribe)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (email IS NOT NULL);

-- Only authenticated users can view subscribers
CREATE POLICY "Authenticated users can view subscribers" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();