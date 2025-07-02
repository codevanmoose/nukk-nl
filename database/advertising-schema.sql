-- Advertising System Database Schema
-- Run this after the main schema.sql and newsletter-schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Advertisers table - represents companies/individuals who advertise
CREATE TABLE IF NOT EXISTS advertisers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  website TEXT,
  auth_user_id UUID, -- References auth.users if using Supabase Auth
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  billing_address JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table - represents advertising campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'ai_review', 'approved', 'rejected', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Impression-based pricing
  impressions_purchased INTEGER NOT NULL DEFAULT 0,
  impressions_served INTEGER DEFAULT 0,
  impressions_remaining INTEGER GENERATED ALWAYS AS (impressions_purchased - impressions_served) STORED,
  
  -- Budget and pricing
  budget_cents INTEGER NOT NULL, -- Store in cents to avoid floating point issues
  cost_per_impression_cents INTEGER, -- CPM in cents
  
  -- Campaign timing
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Targeting options (for future expansion)
  targeting_options JSONB DEFAULT '{}',
  
  -- Metadata
  approval_notes TEXT,
  rejected_reason TEXT,
  approved_by UUID, -- Could reference admin users
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad creatives table - represents the actual ad content
CREATE TABLE IF NOT EXISTS ad_creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Ad content
  name TEXT NOT NULL, -- Internal name for the creative
  image_url TEXT NOT NULL,
  image_width INTEGER,
  image_height INTEGER,
  file_size_bytes INTEGER,
  
  -- Ad styling
  background_color TEXT NOT NULL DEFAULT '#1a1a1a',
  text_color TEXT NOT NULL DEFAULT '#ffffff',
  
  -- Click destination
  click_url TEXT NOT NULL,
  
  -- AI Moderation
  ai_moderation_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_moderation_notes TEXT,
  ai_moderation_flags JSONB DEFAULT '[]', -- Array of flagged issues
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  
  -- Manual review
  manual_review_notes TEXT,
  reviewed_by UUID, -- Admin user who reviewed
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'active', 'paused')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad impressions tracking - for analytics and billing
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creative_id UUID REFERENCES ad_creatives(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Session tracking
  session_id TEXT NOT NULL,
  user_ip_hash TEXT, -- Hashed IP for privacy
  user_agent_hash TEXT, -- Hashed user agent
  
  -- Impression details
  served_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration_ms INTEGER, -- How long the ad was visible
  
  -- Geographic data (for analytics)
  country_code TEXT,
  city TEXT,
  
  -- Referrer information
  referrer_domain TEXT,
  page_url TEXT
);

-- Ad clicks tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  impression_id UUID REFERENCES ad_impressions(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES ad_creatives(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Click details
  click_x INTEGER, -- X coordinate of click (for heatmaps)
  click_y INTEGER, -- Y coordinate of click
  
  -- Conversion tracking (for future)
  converted BOOLEAN DEFAULT FALSE,
  conversion_value_cents INTEGER
);

-- Payments and invoices
CREATE TABLE IF NOT EXISTS ad_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  
  -- Invoice details
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  
  -- Amounts in cents
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  
  -- Payment processing
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  payment_method TEXT, -- 'stripe', 'bank_transfer', etc.
  
  -- Dates
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  line_items JSONB DEFAULT '[]', -- Detailed breakdown
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertiser credits system (for prepaid credits)
CREATE TABLE IF NOT EXISTS advertiser_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  
  -- Credit details
  amount_cents INTEGER NOT NULL, -- Positive for credits, negative for charges
  type TEXT NOT NULL CHECK (type IN ('purchase', 'refund', 'campaign_charge', 'bonus', 'adjustment')),
  description TEXT NOT NULL,
  
  -- References
  campaign_id UUID REFERENCES campaigns(id), -- If related to a campaign
  invoice_id UUID REFERENCES ad_invoices(id), -- If related to an invoice
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_advertisers_email ON advertisers(email);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON advertisers(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign_id ON ad_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_status ON ad_creatives(status);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_moderation ON ad_creatives(moderation_status);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_creative_id ON ad_impressions(creative_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_served_at ON ad_impressions(served_at);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_session_id ON ad_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_creative_id ON ad_clicks(creative_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_ad_invoices_advertiser_id ON ad_invoices(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_invoices_status ON ad_invoices(status);
CREATE INDEX IF NOT EXISTS idx_advertiser_credits_advertiser_id ON advertiser_credits(advertiser_id);

-- Row Level Security
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Advertisers can only see their own data
CREATE POLICY "Advertisers can view own data" ON advertisers
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Advertisers can update own data" ON advertisers
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- New advertisers can sign up
CREATE POLICY "Anyone can create advertiser account" ON advertisers
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Campaigns: advertisers can only see their own
CREATE POLICY "Advertisers can view own campaigns" ON campaigns
  FOR SELECT USING (
    advertiser_id IN (
      SELECT id FROM advertisers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Advertisers can manage own campaigns" ON campaigns
  FOR ALL USING (
    advertiser_id IN (
      SELECT id FROM advertisers WHERE auth_user_id = auth.uid()
    )
  );

-- Ad creatives: same as campaigns
CREATE POLICY "Advertisers can view own creatives" ON ad_creatives
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN advertisers a ON c.advertiser_id = a.id
      WHERE a.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Advertisers can manage own creatives" ON ad_creatives
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN advertisers a ON c.advertiser_id = a.id
      WHERE a.auth_user_id = auth.uid()
    )
  );

-- Admin policies (for authenticated admin users)
-- Note: You'll need to implement admin role checking
CREATE POLICY "Admins can view all advertisers" ON advertisers
  FOR SELECT USING (auth.role() = 'admin' OR auth.email() = 'admin@nukk.nl');

CREATE POLICY "Admins can manage all campaigns" ON campaigns
  FOR ALL USING (auth.role() = 'admin' OR auth.email() = 'admin@nukk.nl');

CREATE POLICY "Admins can manage all creatives" ON ad_creatives
  FOR ALL USING (auth.role() = 'admin' OR auth.email() = 'admin@nukk.nl');

-- Impression tracking is insert-only for the service
CREATE POLICY "Service can track impressions" ON ad_impressions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view impressions" ON ad_impressions
  FOR SELECT USING (auth.role() = 'admin' OR auth.email() = 'admin@nukk.nl');

-- Click tracking is insert-only for the service
CREATE POLICY "Service can track clicks" ON ad_clicks
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view clicks" ON ad_clicks
  FOR SELECT USING (auth.role() = 'admin' OR auth.email() = 'admin@nukk.nl');

-- Invoices: advertisers can view their own
CREATE POLICY "Advertisers can view own invoices" ON ad_invoices
  FOR SELECT USING (
    advertiser_id IN (
      SELECT id FROM advertisers WHERE auth_user_id = auth.uid()
    )
  );

-- Credits: advertisers can view their own
CREATE POLICY "Advertisers can view own credits" ON advertiser_credits
  FOR SELECT USING (
    advertiser_id IN (
      SELECT id FROM advertisers WHERE auth_user_id = auth.uid()
    )
  );

-- Functions for common operations

-- Function to get advertiser balance
CREATE OR REPLACE FUNCTION get_advertiser_balance(advertiser_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(amount_cents), 0)
  FROM advertiser_credits
  WHERE advertiser_id = advertiser_uuid;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to charge advertiser for impressions
CREATE OR REPLACE FUNCTION charge_advertiser_for_impressions(
  campaign_uuid UUID,
  impression_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  campaign_record campaigns;
  advertiser_uuid UUID;
  charge_amount INTEGER;
BEGIN
  -- Get campaign details
  SELECT * INTO campaign_record FROM campaigns WHERE id = campaign_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate charge
  charge_amount := impression_count * campaign_record.cost_per_impression_cents;
  
  -- Insert credit transaction
  INSERT INTO advertiser_credits (
    advertiser_id,
    amount_cents,
    type,
    description,
    campaign_id
  ) VALUES (
    campaign_record.advertiser_id,
    -charge_amount,
    'campaign_charge',
    'Charged for ' || impression_count || ' impressions',
    campaign_uuid
  );
  
  -- Update campaign impression count
  UPDATE campaigns 
  SET impressions_served = impressions_served + impression_count,
      updated_at = NOW()
  WHERE id = campaign_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-pause campaigns when budget depleted
CREATE OR REPLACE FUNCTION check_and_pause_depleted_campaigns()
RETURNS VOID AS $$
BEGIN
  UPDATE campaigns 
  SET status = 'paused',
      updated_at = NOW()
  WHERE status = 'active' 
    AND impressions_served >= impressions_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamps
CREATE TRIGGER update_advertisers_updated_at
  BEFORE UPDATE ON advertisers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_creatives_updated_at
  BEFORE UPDATE ON ad_creatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_invoices_updated_at
  BEFORE UPDATE ON ad_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional - remove in production)
INSERT INTO advertisers (email, company_name, contact_name, status) VALUES
  ('john@techstartup.nl', 'Tech Startup NL', 'John Doe', 'active'),
  ('maria@creative.nl', 'Creative Agency', 'Maria Smith', 'active'),
  ('info@mediaco.nl', 'Media Company BV', 'Peter van Berg', 'active')
ON CONFLICT (email) DO NOTHING;