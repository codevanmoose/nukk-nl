'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { Analysis } from '@/types';

interface ModelAnalysis {
  model: string;
  provider: string;
  modelType: string;
  analysis: Analysis;
  loading?: boolean;
  error?: string;
}

interface MultiModelAnalysisProps {
  analyses: ModelAnalysis[];
}

export function MultiModelAnalysis({ analyses }: MultiModelAnalysisProps) {
  const [activeTab, setActiveTab] = useState(analyses[0]?.model || 'gpt-4');

  const getIcon = (modelType: string) => {
    switch (modelType) {
      case 'openai':
        return <Brain className="w-4 h-4" />;
      case 'anthropic':
        return <Sparkles className="w-4 h-4" />;
      case 'grok':
        return <Zap className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  // Model metadata
  const modelInfo: Record<string, { name: string; description: string; color: string }> = {
    'gpt-4-turbo-preview': {
      name: 'GPT-4',
      description: 'OpenAI\'s meest geavanceerde model',
      color: 'bg-green-500'
    },
    'claude-3-sonnet': {
      name: 'Claude 3',
      description: 'Anthropic\'s genuanceerde analyse',
      color: 'bg-purple-500'
    },
    'grok-2': {
      name: 'Grok',
      description: 'xAI\'s directe analyse',
      color: 'bg-blue-500'
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Multi-Model Analyse
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vergelijk analyses van verschillende AI-modellen voor een completer beeld
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            {analyses.map((modelAnalysis) => {
              const info = modelInfo[modelAnalysis.analysis.ai_model] || {
                name: modelAnalysis.model,
                color: 'bg-gray-500'
              };
              return (
                <TabsTrigger 
                  key={modelAnalysis.model} 
                  value={modelAnalysis.model}
                  className="flex items-center gap-2"
                >
                  {getIcon(modelAnalysis.modelType)}
                  {info.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {analyses.map((modelAnalysis) => {
            const info = modelInfo[modelAnalysis.analysis.ai_model] || {
              name: modelAnalysis.model,
              description: '',
              color: 'bg-gray-500'
            };

            return (
              <TabsContent key={modelAnalysis.model} value={modelAnalysis.model} className="space-y-4">
                {modelAnalysis.loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Analyse wordt uitgevoerd...</p>
                  </div>
                ) : modelAnalysis.error ? (
                  <div className="text-center py-8 text-red-600">
                    <p>Fout: {modelAnalysis.error}</p>
                  </div>
                ) : (
                  <>
                    {/* Model Info */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${info.color}`}></span>
                          {info.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                      <Badge variant="outline">{modelAnalysis.provider}</Badge>
                    </div>

                    {/* Score Comparison */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {modelAnalysis.analysis.objectivity_score}/100
                        </div>
                        <p className="text-xs text-gray-600">Objectiviteit</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {modelAnalysis.analysis.fact_percentage}%
                        </div>
                        <p className="text-xs text-gray-600">Feiten</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {modelAnalysis.analysis.opinion_percentage}%
                        </div>
                        <p className="text-xs text-gray-600">Meningen</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {modelAnalysis.analysis.suggestive_percentage}%
                        </div>
                        <p className="text-xs text-gray-600">Suggestief</p>
                      </div>
                    </div>

                    {/* Analysis Breakdown */}
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div className="h-full flex">
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${modelAnalysis.analysis.fact_percentage}%` }}
                            title={`${modelAnalysis.analysis.fact_percentage}% Feiten`}
                          />
                          <div 
                            className="bg-yellow-500" 
                            style={{ width: `${modelAnalysis.analysis.opinion_percentage}%` }}
                            title={`${modelAnalysis.analysis.opinion_percentage}% Mening`}
                          />
                          <div 
                            className="bg-orange-500" 
                            style={{ width: `${modelAnalysis.analysis.suggestive_percentage}%` }}
                            title={`${modelAnalysis.analysis.suggestive_percentage}% Suggestief`}
                          />
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${modelAnalysis.analysis.incomplete_percentage}%` }}
                            title={`${modelAnalysis.analysis.incomplete_percentage}% Onvolledig`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Processing Info */}
                    <div className="text-xs text-muted-foreground text-center">
                      Verwerkt in {modelAnalysis.analysis.processing_time_ms}ms
                    </div>
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Comparison Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">📊 Modelconsensus</h4>
          {analyses.length > 1 && !analyses.some(a => a.loading) && (
            <div className="space-y-1 text-sm">
              <p>
                Gemiddelde objectiviteitsscore: <strong>
                  {Math.round(
                    analyses.reduce((sum, a) => sum + a.analysis.objectivity_score, 0) / analyses.length
                  )}/100
                </strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Grootste verschil: {Math.max(...analyses.map(a => a.analysis.objectivity_score)) - 
                                   Math.min(...analyses.map(a => a.analysis.objectivity_score))} punten
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}