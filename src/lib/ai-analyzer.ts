import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { Annotation } from '@/types';
import { ExtractedContent } from './content-extractor';

export interface AnalysisResult {
  objectivity_score: number;
  fact_percentage: number;
  opinion_percentage: number;
  suggestive_percentage: number;
  incomplete_percentage: number;
  annotations: Omit<Annotation, 'id' | 'analysis_id' | 'created_at'>[];
  processing_time_ms: number;
  ai_model: string;
}

export class AIAnalyzer {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private grok: OpenAI | null = null;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Grok uses OpenAI-compatible API
    if (process.env.XAI_API_KEY) {
      this.grok = new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      });
    }
  }

  async analyzeContent(content: ExtractedContent): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Try OpenAI first
      const result = await this.analyzeWithOpenAI(content);
      return {
        ...result,
        processing_time_ms: Date.now() - startTime,
        ai_model: 'gpt-4-turbo-preview'
      };
    } catch (error) {
      console.warn('OpenAI analysis failed, falling back to Anthropic:', error);
      
      try {
        // Fallback to Anthropic
        const result = await this.analyzeWithAnthropic(content);
        return {
          ...result,
          processing_time_ms: Date.now() - startTime,
          ai_model: 'claude-3-sonnet'
        };
      } catch (anthropicError) {
        console.warn('Anthropic analysis failed, falling back to Grok:', anthropicError);
        
        if (this.grok) {
          try {
            // Fallback to Grok
            const result = await this.analyzeWithGrok(content);
            return {
              ...result,
              processing_time_ms: Date.now() - startTime,
              ai_model: 'grok-beta'
            };
          } catch (grokError) {
            console.error('All AI services failed:', grokError);
            throw new Error('Analysis failed with all AI providers');
          }
        } else {
          console.error('Both AI services failed and Grok not configured:', anthropicError);
          throw new Error('Analysis failed with both AI providers');
        }
      }
    }
  }

  private async analyzeWithOpenAI(content: ExtractedContent): Promise<Omit<AnalysisResult, 'processing_time_ms' | 'ai_model'>> {
    const systemPrompt = `You are an expert fact-checker and media analyst specializing in Dutch journalism. Your task is to analyze nu.nl articles for objectivity, identifying where opinions are presented as facts, where information is incomplete, or where language is suggestive rather than neutral.

    Analyze the article and provide:
    1. An objectivity score (0-100, where 100 is completely objective)
    2. Percentage breakdown of content types (must sum to 100%):
       - Facts: Verifiable statements with clear sources
       - Opinions: Personal interpretations or subjective statements
       - Suggestive: Implied claims or leading language
       - Incomplete: Missing context or important information
    3. Specific annotations highlighting problematic text

    Return your analysis in the following JSON format:
    {
      "objectivity_score": number,
      "fact_percentage": number,
      "opinion_percentage": number,
      "suggestive_percentage": number,
      "incomplete_percentage": number,
      "annotations": [
        {
          "text_start": number,
          "text_end": number,
          "annotation_type": "fact" | "opinion" | "suggestive" | "incomplete",
          "confidence": number,
          "explanation": "string",
          "sources": []
        }
      ]
    }`;

    const userPrompt = `Please analyze this nu.nl article:

    Title: ${content.title}
    Author: ${content.author || 'Unknown'}
    Content: ${content.cleanedContent}

    Focus on identifying:
    - Subjective language presented as objective fact
    - Missing sources or context
    - Emotional or loaded language
    - Incomplete framing of issues
    - Opinion presented as news`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(response);
    
    // Validate the response structure
    this.validateAnalysisResponse(analysis);
    
    return analysis;
  }

  private async analyzeWithAnthropic(content: ExtractedContent): Promise<Omit<AnalysisResult, 'processing_time_ms' | 'ai_model'>> {
    const prompt = `You are an expert fact-checker and media analyst specializing in Dutch journalism. Analyze this nu.nl article for objectivity.

    Title: ${content.title}
    Author: ${content.author || 'Unknown'}
    Content: ${content.cleanedContent}

    Provide a JSON analysis with:
    - objectivity_score (0-100)
    - percentage breakdown (fact_percentage, opinion_percentage, suggestive_percentage, incomplete_percentage - must sum to 100)
    - annotations array with problematic text segments

    Return only valid JSON in this exact format:
    {
      "objectivity_score": number,
      "fact_percentage": number,
      "opinion_percentage": number,
      "suggestive_percentage": number,
      "incomplete_percentage": number,
      "annotations": []
    }`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content_text = response.content[0];
    if (content_text.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    const analysis = JSON.parse(content_text.text);
    this.validateAnalysisResponse(analysis);
    
    return analysis;
  }

  private async analyzeWithGrok(content: ExtractedContent): Promise<Omit<AnalysisResult, 'processing_time_ms' | 'ai_model'>> {
    if (!this.grok) {
      throw new Error('Grok API not configured');
    }

    const systemPrompt = `You are an expert fact-checker and media analyst specializing in Dutch journalism. Your task is to analyze nu.nl articles for objectivity, identifying where opinions are presented as facts, where information is incomplete, or where language is suggestive rather than neutral.

    Analyze the article and provide:
    1. An objectivity score (0-100, where 100 is completely objective)
    2. Percentage breakdown of content types (must sum to 100%):
       - Facts: Verifiable statements with clear sources
       - Opinions: Personal interpretations or subjective statements
       - Suggestive: Implied claims or leading language
       - Incomplete: Missing context or important information
    3. Specific annotations highlighting problematic text

    Return your analysis in the following JSON format:
    {
      "objectivity_score": number,
      "fact_percentage": number,
      "opinion_percentage": number,
      "suggestive_percentage": number,
      "incomplete_percentage": number,
      "annotations": [
        {
          "text_start": number,
          "text_end": number,
          "annotation_type": "fact" | "opinion" | "suggestive" | "incomplete",
          "confidence": number,
          "explanation": "string",
          "sources": []
        }
      ]
    }`;

    const userPrompt = `Please analyze this nu.nl article:

    Title: ${content.title}
    Author: ${content.author || 'Unknown'}
    Content: ${content.cleanedContent}

    Focus on identifying:
    - Subjective language presented as objective fact
    - Missing sources or context
    - Emotional or loaded language
    - Incomplete framing of issues
    - Opinion presented as news`;

    const completion = await this.grok.chat.completions.create({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from Grok');
    }

    const analysis = JSON.parse(response);
    
    // Validate the response structure
    this.validateAnalysisResponse(analysis);
    
    return analysis;
  }

  private validateAnalysisResponse(analysis: Record<string, unknown>): void {
    const required = ['objectivity_score', 'fact_percentage', 'opinion_percentage', 'suggestive_percentage', 'incomplete_percentage'];
    
    for (const field of required) {
      if (typeof analysis[field] !== 'number') {
        throw new Error(`Invalid analysis response: missing or invalid ${field}`);
      }
    }

    // Check percentages sum to 100 (allow small rounding errors)
    const sum = analysis.fact_percentage + analysis.opinion_percentage + 
                analysis.suggestive_percentage + analysis.incomplete_percentage;
    
    if (Math.abs(sum - 100) > 1) {
      // Normalize percentages if they don't sum to 100
      const factor = 100 / sum;
      analysis.fact_percentage = Math.round(analysis.fact_percentage * factor);
      analysis.opinion_percentage = Math.round(analysis.opinion_percentage * factor);
      analysis.suggestive_percentage = Math.round(analysis.suggestive_percentage * factor);
      analysis.incomplete_percentage = 100 - analysis.fact_percentage - analysis.opinion_percentage - analysis.suggestive_percentage;
    }

    // Ensure objectivity score is in valid range
    analysis.objectivity_score = Math.max(0, Math.min(100, analysis.objectivity_score));

    // Ensure annotations array exists
    if (!Array.isArray(analysis.annotations)) {
      analysis.annotations = [];
    }
  }
}

// Singleton instance
let aiAnalyzer: AIAnalyzer | null = null;

export function getAIAnalyzer(): AIAnalyzer {
  if (!aiAnalyzer) {
    aiAnalyzer = new AIAnalyzer();
  }
  return aiAnalyzer;
}