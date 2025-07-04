import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { Annotation } from '@/types';
import { ExtractedContent } from './scraping-service';

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
  private gemini: OpenAI | null = null;

  constructor() {
    // Check if API keys are available
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!openaiKey && !anthropicKey) {
      console.warn('No AI API keys configured - using mock analysis for demonstration');
    }
    
    this.openai = new OpenAI({
      apiKey: openaiKey || 'sk-dummy-key-for-initialization',
    });
    
    this.anthropic = new Anthropic({
      apiKey: anthropicKey || 'sk-ant-dummy-key-for-initialization',
    });

    // Grok uses OpenAI-compatible API
    if (process.env.XAI_API_KEY) {
      this.grok = new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      });
    }
    
    // Gemini/Perplexity can be added here
    // For now, we'll use mock for third model
  }

  async analyzeWithModel(content: ExtractedContent, model: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Check if API keys are configured for production use
    const hasRealKeys = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy') &&
                       process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('dummy');
    
    try {
      switch (model) {
        case 'openai':
        case 'gpt-4':
          if (!hasRealKeys) return this.getMockAnalysis(content, startTime, 'gpt-4-turbo-preview');
          const openaiResult = await this.analyzeWithOpenAI(content);
          return {
            ...openaiResult,
            processing_time_ms: Date.now() - startTime,
            ai_model: 'gpt-4-turbo-preview'
          };
          
        case 'anthropic':
        case 'claude':
          if (!hasRealKeys) return this.getMockAnalysis(content, startTime, 'claude-3-sonnet');
          const anthropicResult = await this.analyzeWithAnthropic(content);
          return {
            ...anthropicResult,
            processing_time_ms: Date.now() - startTime,
            ai_model: 'claude-3-sonnet'
          };
          
        case 'grok':
        case 'xai':
          if (!this.grok || !hasRealKeys) return this.getMockAnalysis(content, startTime, 'grok-beta');
          const grokResult = await this.analyzeWithGrok(content);
          return {
            ...grokResult,
            processing_time_ms: Date.now() - startTime,
            ai_model: 'grok-beta'
          };
          
        case 'gemini':
        case 'perplexity':
          // For now, return mock with slight variations
          return this.getMockAnalysis(content, startTime, 'gemini-pro');
          
        default:
          throw new Error(`Unknown model: ${model}`);
      }
    } catch (error) {
      console.error(`Error analyzing with ${model}:`, error);
      // Return mock analysis as fallback
      return this.getMockAnalysis(content, startTime, model);
    }
  }

  async analyzeContent(content: ExtractedContent): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Check if API keys are configured
    if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
      // Return mock analysis for demonstration
      console.log('Using mock analysis - API keys not configured');
      return this.getMockAnalysis(content, startTime);
    }
    
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

    IMPORTANT: Even if the article is short or appears to be a demo/test, analyze what content IS present. Do not mark everything as "incomplete" just because it's brief. Focus on the actual sentences provided.

    Analyze the article and provide:
    1. An objectivity score (0-100, where 100 is completely objective)
    2. Percentage breakdown of content types (must sum to 100%):
       - Facts: Verifiable statements with clear sources
       - Opinions: Personal interpretations or subjective statements  
       - Suggestive: Implied claims or leading language
       - Incomplete: Missing context or important information
    3. Specific annotations highlighting problematic text

    For demo/test content, be generous with scoring - analyze the style and approach rather than penalizing for brevity.

    Return your analysis in the following JSON format:
    {
      "objectivity_score": number,
      "fact_percentage": number,
      "opinion_percentage": number,
      "suggestive_percentage": number,
      "incomplete_percentage": number,
      "annotations": [
        {
          "text": "exact text being annotated",
          "type": "fact" | "opinion" | "suggestive" | "incomplete",
          "confidence": number (0-1),
          "reasoning": "explanation in Dutch",
          "start_index": number,
          "end_index": number
        }
      ]
    }
    
    IMPORTANT: For each annotation, include the exact text snippet and calculate start_index and end_index based on the position in the cleaned content. Include 3-5 meaningful annotations that best illustrate the article's objectivity issues.`;

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

    console.log('OpenAI raw response:', response.substring(0, 200) + '...');
    
    const analysis = JSON.parse(response);
    
    console.log('Parsed analysis:', JSON.stringify(analysis, null, 2).substring(0, 300) + '...');
    
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
    
    // Set default values if missing
    if (typeof analysis.objectivity_score !== 'number') {
      analysis.objectivity_score = 50; // Default neutral score
    }
    
    // If percentages are missing, calculate from objectivity score
    const hasAllPercentages = required.slice(1).every(field => typeof analysis[field] === 'number');
    
    if (!hasAllPercentages) {
      const score = analysis.objectivity_score as number;
      // Estimate percentages based on objectivity score
      analysis.fact_percentage = Math.round(score * 0.8);
      analysis.opinion_percentage = Math.round((100 - score) * 0.4);
      analysis.suggestive_percentage = Math.round((100 - score) * 0.3);
      analysis.incomplete_percentage = Math.round((100 - score) * 0.3);
    }

    // Check percentages sum to 100 (allow small rounding errors)
    const sum = (analysis.fact_percentage as number) + (analysis.opinion_percentage as number) + 
                (analysis.suggestive_percentage as number) + (analysis.incomplete_percentage as number);
    
    if (Math.abs(sum - 100) > 1) {
      // Normalize percentages if they don't sum to 100
      const factor = 100 / sum;
      analysis.fact_percentage = Math.round((analysis.fact_percentage as number) * factor);
      analysis.opinion_percentage = Math.round((analysis.opinion_percentage as number) * factor);
      analysis.suggestive_percentage = Math.round((analysis.suggestive_percentage as number) * factor);
      analysis.incomplete_percentage = 100 - (analysis.fact_percentage as number) - (analysis.opinion_percentage as number) - (analysis.suggestive_percentage as number);
    }

    // Ensure objectivity score is in valid range
    analysis.objectivity_score = Math.max(0, Math.min(100, analysis.objectivity_score as number));

    // Ensure annotations array exists
    if (!Array.isArray(analysis.annotations)) {
      analysis.annotations = [];
    }
    
    // Ensure annotations array exists but don't generate fake ones
    if (analysis.annotations.length === 0) {
      console.warn('AI returned no annotations for this article');
    }
  }

  private getMockAnalysis(content: ExtractedContent, startTime: number, model: string = 'mock'): AnalysisResult {
    // Generate a deterministic but varied score based on content
    const contentLength = content.cleanedContent.length;
    const baseScore = 60 + (contentLength % 30);
    
    // Create mock annotations
    const sentences = content.cleanedContent.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
    const mockAnnotations: Omit<Annotation, 'id' | 'analysis_id' | 'created_at'>[] = [];
    
    // Add a few mock annotations
    const annotationCount = Math.min(3, sentences.length);
    for (let i = 0; i < annotationCount; i++) {
      const sentence = sentences[i].trim();
      const types = ['incomplete', 'opinion', 'suggestive'];
      const type = types[i % types.length] as 'fact' | 'opinion' | 'suggestive' | 'incomplete';
      
      mockAnnotations.push({
        text: sentence,
        type,
        confidence: 0.85 + (Math.random() * 0.15),
        start_index: content.cleanedContent.indexOf(sentence),
        end_index: content.cleanedContent.indexOf(sentence) + sentence.length,
        reasoning: `Mock analysis: This appears to be ${type === 'fact' ? 'a factual statement' : type === 'opinion' ? 'an opinion' : type === 'suggestive' ? 'suggestive language' : 'incomplete information'}.`
      });
    }
    
    return {
      objectivity_score: baseScore,
      fact_percentage: 60,
      opinion_percentage: 20,
      suggestive_percentage: 15,
      incomplete_percentage: 5,
      annotations: mockAnnotations,
      processing_time_ms: Date.now() - startTime,
      ai_model: `${model} (mock)`
    };
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