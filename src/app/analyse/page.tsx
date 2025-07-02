'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isValidNuUrl, normalizeNuUrl } from '@/utils/url-validation';
import { AnalysisResponse } from '@/types';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AdBanner from '@/components/ads/ad-banner';

function AnalyseContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (!response.ok) {
        throw new Error('Analyse mislukt');
      }

      const data: AnalysisResponse = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
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
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Artikel wordt geanalyseerd...</p>
            <p className="text-sm text-muted-foreground mt-2">Dit kan tot 5 seconden duren</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Geen analyse beschikbaar</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{analysis.article.title}</h1>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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

        {/* Ad placement: Between analysis summary and detailed view */}
        <div className="py-4">
          <AdBanner 
            slot="1122334455" 
            format="horizontal"
            className="min-h-[90px]"
          />
        </div>

        {/* Coming Soon - Full Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Gedetailleerde Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Gedetailleerde tekstanalyse met highlights komt binnenkort...</p>
              <p className="text-sm">
                Analyseverwerking duurde {analysis.analysis.processing_time_ms}ms 
                • Model: {analysis.analysis.ai_model}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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