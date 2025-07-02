import { NextRequest, NextResponse } from 'next/server';
import { isValidNuUrl, normalizeNuUrl } from '@/utils/url-validation';
import { AnalysisResponse } from '@/types';
import { getContentExtractor } from '@/lib/content-extractor';
import { getAIAnalyzer } from '@/lib/ai-analyzer';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !isValidNuUrl(url)) {
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
    const extractor = await getContentExtractor();
    const extractedContent = await extractor.extractFromNuNl(normalizedUrl);
    
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
    const analyzer = getAIAnalyzer();
    const analysisResult = await analyzer.analyzeContent(extractedContent);
    
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

    // Store annotations
    const annotations = [];
    if (analysisResult.annotations.length > 0) {
      const annotationsToInsert = analysisResult.annotations.map(ann => ({
        analysis_id: analysis.id,
        text_start: ann.text_start,
        text_end: ann.text_end,
        annotation_type: ann.annotation_type,
        confidence: ann.confidence,
        explanation: ann.explanation,
        sources: ann.sources || []
      }));

      const { data: insertedAnnotations, error: annotationsError } = await supabaseAdmin
        .from('annotations')
        .insert(annotationsToInsert)
        .select();

      if (annotationsError) {
        console.warn('Failed to store annotations:', annotationsError);
      } else {
        annotations.push(...(insertedAnnotations || []));
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