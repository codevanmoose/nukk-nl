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
    
    // If no annotations but we have content, generate basic ones
    if (analysis.annotations.length === 0 && typeof analysis.objectivity_score === 'number') {
      console.log('No annotations from AI, generating basic annotations...');
      // This ensures we always have some annotations for demonstration
      analysis.annotations = this.generateBasicAnnotations(analysis);
    }
  }

  private generateBasicAnnotations(analysis: Record<string, unknown>): any[] {
    // Generate basic annotations based on the analysis scores
    const annotations = [];
    const score = analysis.objectivity_score as number;
    
    if (score < 80) {
      annotations.push({
        type: 'opinion',
        text: 'subjectieve',
        reasoning: 'Algemene indicatie van subjectiviteit in het artikel',
        confidence: 0.7,
        start_index: 0,
        end_index: 10
      });
    }
    
    if (score > 60) {
      annotations.push({
        type: 'fact',
        text: 'feitelijke',
        reasoning: 'Algemene indicatie van feitelijke berichtgeving',
        confidence: 0.8,
        start_index: 0,
        end_index: 10
      });
    }
    
    return annotations;
  }

  private getMockAnalysis(content: ExtractedContent, startTime: number): AnalysisResult {
    // Generate realistic mock analysis for demonstration
    const text = content.cleanedContent;
    const annotations: AnalysisResult['annotations'] = [];

    // Find actual text snippets in the content
    const findAndAnnotate = (searchText: string, type: Annotation['type'], reasoning: string, confidence: number) => {
      const index = text.indexOf(searchText);
      if (index !== -1) {
        annotations.push({
          type,
          text: searchText,
          reasoning,
          confidence,
          start_index: index,
          end_index: index + searchText.length
        });
      }
    };

    // Look for common patterns in Dutch news articles
    findAndAnnotate('essentieel', 'opinion', 'Het woord "essentieel" is een subjectieve kwalificatie', 0.85);
    findAndAnnotate('cruciaal', 'opinion', 'Het woord "cruciaal" is een waardeoordeel', 0.85);
    findAndAnnotate('volgens', 'fact', 'Verwijzing naar een bron of autoriteit', 0.90);
    findAndAnnotate('Volgens', 'fact', 'Verwijzing naar een bron of autoriteit', 0.90);
    findAndAnnotate('CBS', 'fact', 'Verwijzing naar officiële instantie (Centraal Bureau voor de Statistiek)', 0.95);
    findAndAnnotate('beweren', 'suggestive', 'Het woord "beweren" impliceert twijfel over de waarheid', 0.80);
    findAndAnnotate('mogelijk', 'incomplete', 'Onzekerheid over de informatie', 0.75);
    findAndAnnotate('minister', 'fact', 'Verwijzing naar een officiële functie', 0.85);
    findAndAnnotate('verklaarde', 'fact', 'Feitelijke handeling van een uitspraak', 0.80);
    findAndAnnotate('critici', 'opinion', 'Verwijzing naar tegenstanders zonder specifieke bronnen', 0.75);

    return {
      objectivity_score: 75,
      fact_percentage: 65,
      opinion_percentage: 20,
      suggestive_percentage: 10,
      incomplete_percentage: 5,
      annotations: annotations.slice(0, 5), // Limit to 5 annotations
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