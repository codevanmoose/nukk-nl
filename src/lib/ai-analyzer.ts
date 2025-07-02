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
  }

  private getMockAnalysis(content: ExtractedContent, startTime: number): AnalysisResult {
    // Generate realistic mock analysis for demonstration
    const annotations: AnalysisResult['annotations'] = [
      {
        type: 'fact',
        text: 'Het CDA heeft aangekondigd tegen de plannen te stemmen',
        reasoning: 'Dit is een verifieerbaar feit over de stemintentie van het CDA',
        confidence: 0.95,
        start_index: 100,
        end_index: 155
      },
      {
        type: 'opinion',
        text: 'belangrijke tegenslag',
        reasoning: 'Het woord "belangrijke" is een subjectieve kwalificatie',
        confidence: 0.85,
        start_index: 400,
        end_index: 420
      },
      {
        type: 'suggestive',
        text: 'lijken te stranden',
        reasoning: 'Suggereert een uitkomst die nog niet definitief is',
        confidence: 0.80,
        start_index: 20,
        end_index: 38
      }
    ];

    return {
      objectivity_score: 75,
      fact_percentage: 65,
      opinion_percentage: 20,
      suggestive_percentage: 10,
      incomplete_percentage: 5,
      annotations,
      processing_time_ms: Date.now() - startTime,
      ai_model: 'mock-demo'
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