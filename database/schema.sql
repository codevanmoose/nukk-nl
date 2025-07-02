-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nu_url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    raw_content TEXT NOT NULL,
    cleaned_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses table
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    objectivity_score INTEGER NOT NULL CHECK (objectivity_score >= 0 AND objectivity_score <= 100),
    fact_percentage DECIMAL(5,2) NOT NULL CHECK (fact_percentage >= 0 AND fact_percentage <= 100),
    opinion_percentage DECIMAL(5,2) NOT NULL CHECK (opinion_percentage >= 0 AND opinion_percentage <= 100),
    suggestive_percentage DECIMAL(5,2) NOT NULL CHECK (suggestive_percentage >= 0 AND suggestive_percentage <= 100),
    incomplete_percentage DECIMAL(5,2) NOT NULL CHECK (incomplete_percentage >= 0 AND incomplete_percentage <= 100),
    ai_model TEXT NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT percentages_sum_100 CHECK (
        fact_percentage + opinion_percentage + suggestive_percentage + incomplete_percentage = 100
    )
);

-- Annotations table
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    text_start INTEGER NOT NULL,
    text_end INTEGER NOT NULL,
    annotation_type TEXT NOT NULL CHECK (annotation_type IN ('fact', 'opinion', 'suggestive', 'incomplete')),
    confidence DECIMAL(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    explanation TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feedback table
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'missing_context')),
    comment TEXT,
    user_ip_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_articles_nu_url ON articles(nu_url);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_analyses_article_id ON analyses(article_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_annotations_analysis_id ON annotations(analysis_id);
CREATE INDEX idx_annotations_type ON annotations(annotation_type);
CREATE INDEX idx_user_feedback_analysis_id ON user_feedback(analysis_id);

-- RLS (Row Level Security) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated and anonymous users
CREATE POLICY "Allow read access to articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow read access to analyses" ON analyses FOR SELECT USING (true);
CREATE POLICY "Allow read access to annotations" ON annotations FOR SELECT USING (true);

-- Allow insert/update for service role only (backend operations)
CREATE POLICY "Allow insert to articles" ON articles FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Allow insert to analyses" ON analyses FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Allow insert to annotations" ON annotations FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow anyone to submit feedback
CREATE POLICY "Allow insert to user_feedback" ON user_feedback FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();