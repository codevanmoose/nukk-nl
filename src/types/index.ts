export interface Article {
  id: string;
  nu_url: string;
  title: string;
  author?: string;
  published_at?: Date;
  raw_content: string;
  cleaned_content: string;
  created_at: Date;
}

export interface Analysis {
  id: string;
  article_id: string;
  objectivity_score: number;
  fact_percentage: number;
  opinion_percentage: number;
  suggestive_percentage: number;
  incomplete_percentage: number;
  ai_model: string;
  processing_time_ms: number;
  created_at: Date;
}

export interface Annotation {
  id: string;
  analysis_id?: string;
  // New format fields
  type: 'fact' | 'opinion' | 'suggestive' | 'incomplete';
  text: string;
  reasoning: string;
  confidence: number;
  start_index: number;
  end_index: number;
  // Old format fields (for compatibility)
  text_start?: number;
  text_end?: number;
  annotation_type?: 'fact' | 'opinion' | 'suggestive' | 'incomplete';
  explanation?: string;
  sources?: unknown[];
  created_at?: Date;
}

export interface UserFeedback {
  id: string;
  analysis_id: string;
  feedback_type: string;
  comment: string;
  user_ip_hash: string;
  created_at: Date;
}

export interface AnalysisRequest {
  url: string;
}

export interface AnalysisResponse {
  article: Article;
  analysis: Analysis;
  annotations: Annotation[];
}