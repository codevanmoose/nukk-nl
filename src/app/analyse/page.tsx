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
import { PublicPageLayout } from '@/components/layout/public-page-layout';

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

  if (!url) {
    return (
      <PublicPageLayout showUrlInput={false}>
        <Card className="w-full">
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
      </PublicPageLayout>
    );
  }

  if (error) {
    return (
      <PublicPageLayout showUrlInput={false}>
        <Card className="w-full">
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
      </PublicPageLayout>
    );
  }

  if (isLoading) {
    return (
      <PublicPageLayout showUrlInput={false}>
        <Card className="w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Artikel wordt geanalyseerd...</p>
            <p className="text-sm text-muted-foreground mt-2">Dit kan tot 5 seconden duren</p>
          </CardContent>
        </Card>
      </PublicPageLayout>
    );
  }

  if (!analysis) {
    return (
      <PublicPageLayout showUrlInput={false}>
        <Card className="w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Geen analyse beschikbaar</p>
          </CardContent>
        </Card>
      </PublicPageLayout>
    );
  }

  return (
    <>
      <PublicPageLayout showUrlInput={false}>
        <div className="h-full overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Terug
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold">{analysis.article.title}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>Door {analysis.article.author || 'Onbekend'}</span>
                  <span>•</span>
                  <a 
                    href={analysis.article.nu_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    Origineel artikel
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Objectiviteitsscore</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {analysis.analysis.objectivity_score}/100
                    </div>
                    <p className="text-muted-foreground">Objectiviteit van dit artikel</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
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
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Feiten ({analysis.analysis.fact_percentage}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>Mening ({analysis.analysis.opinion_percentage}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span>Suggestief ({analysis.analysis.suggestive_percentage}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Onvolledig ({analysis.analysis.incomplete_percentage}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Explanation */}
                  <div className="text-sm text-muted-foreground text-center">
                    {analysis.analysis.objectivity_score >= 80 && (
                      <p>🟢 Hoge objectiviteit - Dit artikel bevat voornamelijk feiten met goede bronvermelding</p>
                    )}
                    {analysis.analysis.objectivity_score >= 60 && analysis.analysis.objectivity_score < 80 && (
                      <p>🟡 Gemiddelde objectiviteit - Let op enkele subjectieve elementen</p>
                    )}
                    {analysis.analysis.objectivity_score >= 40 && analysis.analysis.objectivity_score < 60 && (
                      <p>🟠 Lage objectiviteit - Aanzienlijk aandeel mening of suggestieve taal</p>
                    )}
                    {analysis.analysis.objectivity_score < 40 && (
                      <p>🔴 Zeer lage objectiviteit - Voornamelijk mening gepresenteerd als nieuws</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicPageLayout>

      {/* Extended Analysis - Below the fold */}
      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Multi-Model Toggle */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Vergelijk AI Modellen</h3>
                  <p className="text-sm text-muted-foreground">
                    Zie hoe verschillende AI's dit artikel analyseren
                  </p>
                </div>
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
                {showMultiModel ? 'Verberg vergelijking' : 'Toon vergelijking'}
              </Button>
            </div>
          </Card>

          {/* Multi-Model Analysis */}
          {showMultiModel && multiModelAnalyses.length > 0 && (
            <MultiModelAnalysis analyses={multiModelAnalyses} />
          )}
          
          {showMultiModel && multiModelAnalyses.length === 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-muted-foreground">Multi-model analyses laden...</span>
              </div>
            </Card>
          )}

          {/* Detailed Text Analysis with Highlights */}
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