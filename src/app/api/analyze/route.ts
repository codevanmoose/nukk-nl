import { NextRequest, NextResponse } from 'next/server';
import { isValidNuUrl, normalizeNuUrl } from '@/utils/url-validation';
import { AnalysisResponse } from '@/types';
import { getScrapingService } from '@/lib/scraping-service';
import { getAIAnalyzer } from '@/lib/ai-analyzer';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  console.log('[Analyze API] Request received');
  
  try {
    const body = await request.json();
    const { url } = body;
    
    console.log('[Analyze API] URL:', url);

    if (!url || !isValidNuUrl(url)) {
      console.error('[Analyze API] Invalid URL:', url);
      return NextResponse.json(
        { error: 'Invalid nu.nl URL provided' },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeNuUrl(url);
    
    // Check if we already have this article analyzed
    const { data: existingArticle } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        analyses (
          *,
          annotations (*)
        )
      `)
      .eq('nu_url', normalizedUrl)
      .single();

    if (existingArticle && existingArticle.analyses?.length > 0) {
      // Return existing analysis
      const analysis = existingArticle.analyses[0];
      return NextResponse.json({
        article: existingArticle,
        analysis,
        annotations: analysis.annotations || []
      });
    }

    // Extract content from nu.nl
    console.log('[Analyze API] Scraping article...');
    const scraper = getScrapingService();
    const extractedContent = await scraper.scrapeNuNl(normalizedUrl);
    console.log('[Analyze API] Article scraped successfully');
    
    // Store or update article
    const { data: article, error: articleError } = await supabaseAdmin
      .from('articles')
      .upsert({
        nu_url: normalizedUrl,
        title: extractedContent.title,
        author: extractedContent.author,
        published_at: extractedContent.publishedAt?.toISOString(),
        raw_content: extractedContent.rawContent,
        cleaned_content: extractedContent.cleanedContent,
      })
      .select()
      .single();

    if (articleError || !article) {
      throw new Error('Failed to store article: ' + articleError?.message);
    }

    // Analyze with AI
    console.log('[Analyze API] Starting AI analysis...');
    const analyzer = getAIAnalyzer();
    const analysisResult = await analyzer.analyzeContent(extractedContent);
    console.log('[Analyze API] AI analysis completed');
    
    // Store analysis
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from('analyses')
      .insert({
        article_id: article.id,
        objectivity_score: analysisResult.objectivity_score,
        fact_percentage: analysisResult.fact_percentage,
        opinion_percentage: analysisResult.opinion_percentage,
        suggestive_percentage: analysisResult.suggestive_percentage,
        incomplete_percentage: analysisResult.incomplete_percentage,
        ai_model: analysisResult.ai_model,
        processing_time_ms: analysisResult.processing_time_ms,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      throw new Error('Failed to store analysis: ' + analysisError?.message);
    }

    // Store annotations - map to existing database schema
    const annotations = [];
    if (analysisResult.annotations.length > 0) {
      const annotationsToInsert = analysisResult.annotations.map(ann => ({
        analysis_id: analysis.id,
        text_start: ann.start_index,
        text_end: ann.end_index,
        annotation_type: ann.type,
        confidence: ann.confidence,
        explanation: ann.reasoning,
        sources: []
      }));

      const { data: insertedAnnotations, error: annotationsError } = await supabaseAdmin
        .from('annotations')
        .insert(annotationsToInsert)
        .select();

      if (annotationsError) {
        console.warn('Failed to store annotations:', annotationsError);
      } else {
        // Map back to our format for the response
        const mappedAnnotations = (insertedAnnotations || []).map((dbAnn, index) => ({
          id: dbAnn.id,
          type: dbAnn.annotation_type,
          text: analysisResult.annotations[index]?.text || '',
          reasoning: dbAnn.explanation,
          confidence: dbAnn.confidence,
          start_index: dbAnn.text_start,
          end_index: dbAnn.text_end,
          created_at: dbAnn.created_at
        }));
        annotations.push(...mappedAnnotations);
      }
    }

    const response: AnalysisResponse = {
      article,
      analysis,
      annotations
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}