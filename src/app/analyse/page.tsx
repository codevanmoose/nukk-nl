'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isValidNuUrl, normalizeNuUrl } from '@/utils/url-validation';
import { AnalysisResponse, Analysis } from '@/types';
import { ArrowLeft, ExternalLink, Loader2, Brain, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { AnalysisHighlights } from '@/components/analysis-highlights';
import { MultiModelAnalysis } from '@/components/multi-model-analysis';

interface ModelAnalysis {
  model: string;
  provider: string;
  icon: React.ReactNode;
  analysis: Analysis;
  annotations: Array<{
    id?: string;
    type: string;
    text: string;
    reasoning: string;
    confidence: number;
    start_index: number;
    end_index: number;
    created_at?: string;
  }>;
}
import SplitScreenLayout from '@/components/layout/split-screen-layout';
import Footer from '@/components/layout/footer';

function AnalyseContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [multiModelAnalyses, setMultiModelAnalyses] = useState<ModelAnalysis[]>([]);
  const [isLoadingMultiModel, setIsLoadingMultiModel] = useState(false);

  useEffect(() => {
    if (url && isValidNuUrl(url)) {
      analyzeArticle(url);
    } else if (url) {
      setError('Ongeldige nu.nl URL');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const analyzeArticle = async (articleUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedUrl = normalizeNuUrl(articleUrl);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();
      
      console.log('API Response:', { 
        status: response.status, 
        ok: response.ok,
        hasError: !!data.error,
        hasAnalysis: !!data.analysis
      });
      
      if (!response.ok) {
        console.error('API Error Response:', data);
        if (data.error && data.error.includes('AI service not configured')) {
          throw new Error('AI analyse service is momenteel niet beschikbaar. Probeer het later opnieuw.');
        }
        throw new Error(data.error || 'Analyse mislukt. Probeer het later opnieuw.');
      }

      if (data.error) {
        console.error('Error in response data:', data.error);
        throw new Error(data.error);
      }

      // Check if we have valid analysis data
      if (!data.analysis || typeof data.analysis.objectivity_score !== 'number') {
        console.error('Invalid analysis data:', data);
        throw new Error('Ongeldige analyse data ontvangen. Probeer het opnieuw.');
      }

      setAnalysis(data as AnalysisResponse);
      
      // Automatically fetch multi-model analyses
      fetchMultiModelAnalyses(normalizedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMultiModelAnalyses = async (normalizedUrl: string) => {
    setIsLoadingMultiModel(true);
    
    try {
      const response = await fetch('/api/analyze-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: normalizedUrl,
          models: ['openai', 'anthropic', 'grok'] // Fixed: use 'grok' instead of 'gemini'
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.analyses) {
        const formattedAnalyses = data.analyses.map((item: { model: string; analysis: Analysis; annotations: Array<{ id?: string; type: string; text: string; reasoning: string; confidence: number; start_index: number; end_index: number; created_at?: string }> }) => ({
          model: item.model === 'openai' ? 'gpt-4' : item.model === 'anthropic' ? 'claude-3' : 'grok',
          provider: item.model === 'openai' ? 'OpenAI' : item.model === 'anthropic' ? 'Anthropic' : 'xAI',
          icon: item.model === 'openai' ? <Brain className="w-4 h-4" /> : 
                item.model === 'anthropic' ? <Sparkles className="w-4 h-4" /> : 
                <Zap className="w-4 h-4" />,
          analysis: item.analysis,
          annotations: item.annotations || []
        }));
        setMultiModelAnalyses(formattedAnalyses);
      }
    } catch (error) {
      console.error('Failed to fetch multi-model analyses:', error);
    } finally {
      setIsLoadingMultiModel(false);
    }
  };

  // Left pane content (article info and navigation)
  const leftPaneContent = (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
        </Link>
        
        {analysis && (
          <>
            <h1 className="text-xl font-bold mb-2">{analysis.article.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Door {analysis.article.author || 'Onbekend'}</span>
            </div>
            <a 
              href={analysis.article.nu_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
            >
              Origineel artikel
              <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>

      {/* Objectivity Score Summary */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Objectiviteitsscore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600">
                {analysis.analysis.objectivity_score}/100
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-3">
              <div className="h-full flex">
                <div 
                  className="bg-green-500" 
                  style={{ width: `${analysis.analysis.fact_percentage}%` }}
                  title={`${analysis.analysis.fact_percentage}% Feiten`}
                />
                <div 
                  className="bg-yellow-500" 
                  style={{ width: `${analysis.analysis.opinion_percentage}%` }}
                  title={`${analysis.analysis.opinion_percentage}% Mening`}
                />
                <div 
                  className="bg-orange-500" 
                  style={{ width: `${analysis.analysis.suggestive_percentage}%` }}
                  title={`${analysis.analysis.suggestive_percentage}% Suggestief`}
                />
                <div 
                  className="bg-red-500" 
                  style={{ width: `${analysis.analysis.incomplete_percentage}%` }}
                  title={`${analysis.analysis.incomplete_percentage}% Onvolledig`}
                />
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded"></div>
                <span>Feit ({analysis.analysis.fact_percentage}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                <span>Mening ({analysis.analysis.opinion_percentage}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded"></div>
                <span>Suggestief ({analysis.analysis.suggestive_percentage}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded"></div>
                <span>Onvolledig ({analysis.analysis.incomplete_percentage}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-Model Status */}
      {analysis && isLoadingMultiModel && (
        <Card className="mt-4 p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium">AI modellen laden...</span>
          </div>
        </Card>
      )}
    </div>
  );

  // Right pane content with analysis overlay
  const rightPaneContent = (
    <div className="relative h-full w-full">
      {/* Background Ad - Always show the gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Analysis Overlay */}
      {analysis && (
        <div className="absolute inset-0 overflow-y-auto">
          <div className="p-8 space-y-6">
            {/* Multi-Model Analysis - Always show when available */}
            {multiModelAnalyses.length > 0 && (
              <MultiModelAnalysis analyses={multiModelAnalyses} />
            )}
            
            {/* Loading indicator for multi-model analyses */}
            {isLoadingMultiModel && multiModelAnalyses.length === 0 && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-muted-foreground">AI modellen analyseren het artikel...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Text Analysis */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Gedetailleerde Tekstanalyse</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisHighlights 
                  text={analysis.article.cleaned_content}
                  annotations={analysis.annotations || []}
                />
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  Analyseverwerking duurde {analysis.analysis.processing_time_ms}ms 
                  • Model: {analysis.analysis.ai_model}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  // Loading and error states
  if (!url) {
    return (
      <SplitScreenLayout
        leftContent={
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Geen URL opgegeven</p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Terug naar home
                </Button>
              </Link>
            </CardContent>
          </Card>
        }
        rightContent={
          <div className="relative h-full w-full">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <SplitScreenLayout
        leftContent={
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Probeer opnieuw
                </Button>
              </Link>
            </CardContent>
          </Card>
        }
        rightContent={
          <div className="relative h-full w-full">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <SplitScreenLayout
        leftContent={
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Artikel wordt geanalyseerd...</p>
              <p className="text-sm text-muted-foreground mt-2">Dit kan tot 5 seconden duren</p>
            </CardContent>
          </Card>
        }
        rightContent={
          <div className="relative h-full w-full">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        }
      />
    );
  }

  // Main render with analysis
  return (
    <>
      <SplitScreenLayout
        leftContent={leftPaneContent}
        rightContent={rightPaneContent}
      />
      <Footer />
    </>
  );
}

export default function AnalysePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    }>
      <AnalyseContent />
    </Suspense>
  );
}