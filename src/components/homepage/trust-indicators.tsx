'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, CheckCircle, Clock, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
  totalAnalyses: number;
  averageAccuracy: number;
  averageProcessingTime: number;
  uniqueArticles: number;
}

export default function TrustIndicators() {
  const [stats, setStats] = useState<Stats>({
    totalAnalyses: 0,
    averageAccuracy: 95,
    averageProcessingTime: 3000,
    uniqueArticles: 0
  });

  useEffect(() => {
    // Fetch stats on component mount
    fetchStats();
    
    // Update stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatProcessingTime = (ms: number): string => {
    const seconds = ms / 1000;
    return seconds < 5 ? '<5s' : `${Math.round(seconds)}s`;
  };

  const indicators = [
    {
      icon: BarChart3,
      value: `${stats.averageAccuracy}%`,
      label: 'Nauwkeurigheid',
      description: 'Gemiddelde objectiviteit'
    },
    {
      icon: CheckCircle,
      value: stats.totalAnalyses > 0 ? stats.totalAnalyses.toLocaleString('nl-NL') : '0',
      label: 'Analyses',
      description: 'Totaal uitgevoerd'
    },
    {
      icon: Clock,
      value: formatProcessingTime(stats.averageProcessingTime),
      label: 'Snelheid',
      description: 'Gemiddelde analyse tijd'
    },
    {
      icon: FileText,
      value: stats.uniqueArticles > 0 ? stats.uniqueArticles.toLocaleString('nl-NL') : '0',
      label: 'Artikelen',
      description: 'Unieke nu.nl artikelen'
    }
  ];

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real-time Platform Statistieken
          </h2>
          <p className="text-xl text-muted-foreground">
            Live data uit onze database - bijgewerkt elke 5 minuten
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((indicator, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <indicator.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {indicator.value}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {indicator.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {indicator.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}