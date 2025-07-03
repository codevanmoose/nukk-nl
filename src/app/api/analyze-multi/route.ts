import { NextRequest, NextResponse } from 'next/server';
import { getContentExtractor } from '@/lib/content-extractor-serverless';
import { getAIAnalyzer } from '@/lib/ai-analyzer';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidNuUrl, normalizeNuUrl } from '@/utils/url-validation';

export async function POST(request: NextRequest) {
  try {
    const { url, models = ['openai', 'anthropic'] } = await request.json();

    if (!url || !isValidNuUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid nu.nl URL' },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeNuUrl(url);

    // Check if article exists
    const { data: existingArticle } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('nu_url', normalizedUrl)
      .single();

    let article = existingArticle;

    // Extract content if article doesn't exist
    if (!article) {
      const extractor = getContentExtractor();
      const extractedContent = await extractor.extractFromNuNl(normalizedUrl);

      const { data: newArticle, error: articleError } = await supabaseAdmin
        .from('articles')
        .insert({
          nu_url: normalizedUrl,
          title: extractedContent.title,
          author: extractedContent.author,
          published_at: extractedContent.publishedAt,
          raw_content: extractedContent.rawContent,
          cleaned_content: extractedContent.cleanedContent,
        })
        .select()
        .single();

      if (articleError || !newArticle) {
        throw new Error('Failed to store article: ' + articleError?.message);
      }

      article = newArticle;
    }

    // Analyze with multiple models
    const analyzer = getAIAnalyzer();
    const analyses = [];

    for (const model of models) {
      try {
        const analysisResult = await analyzer.analyzeWithModel(
          {
            title: article.title,
            author: article.author,
            publishedAt: article.published_at,
            rawContent: article.raw_content,
            cleanedContent: article.cleaned_content
          },
          model
        );

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

        if (analysis) {
          analyses.push({
            model,
            analysis,
            annotations: analysisResult.annotations || []
          });
        }
      } catch (error) {
        console.error(`Failed to analyze with ${model}:`, error);
        // Continue with other models
      }
    }

    return NextResponse.json({
      article,
      analyses
    });
  } catch (error) {
    console.error('Multi-model analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}