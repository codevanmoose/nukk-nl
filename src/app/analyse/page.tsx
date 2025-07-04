'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isValidNuUrl, normalizeNuUrl } from '@/utils/url-validation';
import { AnalysisResponse } from '@/types';
import { ArrowLeft, ExternalLink, Loader2, Brain, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { AnalysisHighlights } from '@/components/analysis-highlights';
import { MultiModelAnalysis } from '@/components/multi-model-analysis';
import SplitScreenLayout from '@/components/layout/split-screen-layout';
import PremiumAdPane from '@/components/ads/premium-ad-pane';
import Footer from '@/components/layout/footer';

function AnalyseContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMultiModel, setShowMultiModel] = useState(false);
  const [multiModelAnalyses, setMultiModelAnalyses] = useState<any[]>([]);

  useEffect(() => {
    if (url && isValidNuUrl(url)) {
      analyzeArticle(url);
    } else if (url) {
      setError('Ongeldige nu.nl URL');
    }
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
        throw new Error(data.error || 'Analyse mislukt');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Check if we have valid analysis data
      if (!data.analysis || typeof data.analysis.objectivity_score !== 'number') {
        console.error('Invalid analysis data:', data);
        throw new Error('Ongeldige analyse data ontvangen');
      }

      setAnalysis(data as AnalysisResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMultiModelAnalyses = async () => {
    if (!url) return;
    
    try {
      const normalizedUrl = normalizeNuUrl(url);
      const response = await fetch('/api/analyze-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: normalizedUrl,
          models: ['openai', 'anthropic', 'gemini']
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.analyses) {
        const formattedAnalyses = data.analyses.map((item: any) => ({
          model: item.model === 'openai' ? 'gpt-4' : item.model === 'anthropic' ? 'claude-3' : 'gemini',
          provider: item.model === 'openai' ? 'OpenAI' : item.model === 'anthropic' ? 'Anthropic' : 'Google',
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

      {/* Multi-Model Toggle */}
      {analysis && (
        <Card className="mt-4 p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Vergelijk AI Modellen</span>
            </div>
            <Button 
              variant={showMultiModel ? "default" : "outline"}
              size="sm"
              onClick={async () => {
                if (!showMultiModel && multiModelAnalyses.length === 0) {
                  await fetchMultiModelAnalyses();
                }
                setShowMultiModel(!showMultiModel);
              }}
            >
              {showMultiModel ? 'Verberg' : 'Toon'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  // Right pane content with analysis overlay
  const rightPaneContent = (
    <div className="relative h-full w-full">
      {/* Background Ad */}
      <PremiumAdPane />
      
      {/* Analysis Overlay */}
      {analysis && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm overflow-y-auto">
          <div className="p-8">
            {/* Multi-Model Analysis */}
            {showMultiModel && multiModelAnalyses.length > 0 && (
              <div className="mb-6">
                <MultiModelAnalysis analyses={multiModelAnalyses} />
              </div>
            )}
            
            {showMultiModel && multiModelAnalyses.length === 0 && (
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-muted-foreground">Multi-model analyses laden...</span>
                </div>
              </Card>
            )}

            {/* Detailed Text Analysis */}
            <Card>
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
        rightContent={<PremiumAdPane />}
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
        rightContent={<PremiumAdPane />}
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
        rightContent={<PremiumAdPane />}
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