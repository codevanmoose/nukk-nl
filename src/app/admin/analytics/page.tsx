'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  TrendingDown,
  Euro,
  Users,
  Eye,
  MousePointer,
  Calendar,
  Download,
  BarChart3
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  campaigns: {
    active: number;
    completed: number;
    totalImpressions: number;
    avgCTR: number;
  };
  platform: {
    pageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  topAdvertisers: Array<{
    name: string;
    spent: number;
    impressions: number;
    ctr: number;
  }>;
  recentAnalyses: Array<{
    date: string;
    count: number;
    avgScore: number;
  }>;
}

const mockAnalytics: AnalyticsData = {
  revenue: {
    current: 12450,
    previous: 10820,
    change: 15.1
  },
  campaigns: {
    active: 8,
    completed: 37,
    totalImpressions: 1248567,
    avgCTR: 2.8
  },
  platform: {
    pageViews: 89456,
    uniqueVisitors: 52341,
    avgSessionDuration: 167, // seconds
    bounceRate: 42.1
  },
  topAdvertisers: [
    { name: 'Tech Startup NL', spent: 4499, impressions: 150000, ctr: 3.2 },
    { name: 'Creative Agency', spent: 2999, impressions: 100000, ctr: 2.8 },
    { name: 'E-commerce Plus', spent: 1999, impressions: 66700, ctr: 2.1 },
    { name: 'Media Company BV', spent: 1499, impressions: 50000, ctr: 1.9 }
  ],
  recentAnalyses: [
    { date: '2024-01-20', count: 127, avgScore: 72.4 },
    { date: '2024-01-19', count: 98, avgScore: 68.9 },
    { date: '2024-01-18', count: 112, avgScore: 71.2 },
    { date: '2024-01-17', count: 89, avgScore: 69.7 },
    { date: '2024-01-16', count: 134, avgScore: 73.1 },
    { date: '2024-01-15', count: 156, avgScore: 74.8 },
    { date: '2024-01-14', count: 143, avgScore: 72.0 }
  ]
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics);
  const [timeRange, setTimeRange] = useState('7d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nl-NL').format(num);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const ChangeIndicator = ({ value, isPercentage = false }: { value: number; isPercentage?: boolean }) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs">
          {isPositive ? '+' : ''}{isPercentage ? value.toFixed(1) + '%' : formatNumber(value)}
        </span>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Platform prestaties en advertentie statistieken
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Laatste 7 dagen
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.current)}</div>
              <ChangeIndicator value={analytics.revenue.change} isPercentage />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Campagnes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.campaigns.active}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.campaigns.completed} voltooid deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Impressies</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.campaigns.totalImpressions)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.campaigns.avgCTR}% gemiddelde CTR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Bezoekers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.platform.uniqueVisitors)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(analytics.platform.pageViews)} pageviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed analytics */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Omzet</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="factcheck">Fact-Checks</TabsTrigger>
          </TabsList>

          {/* Revenue analytics */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Adverteerders</CardTitle>
                  <CardDescription>Hoogste uitgaven deze maand</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topAdvertisers.map((advertiser, index) => (
                      <div key={advertiser.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{advertiser.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatNumber(advertiser.impressions)} impressies • {advertiser.ctr}% CTR
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(advertiser.spent)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Omzet Breakdown</CardTitle>
                  <CardDescription>Verdeling per advertentie type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Wallpaper Ads</span>
                      <span className="font-medium">{formatCurrency(11240)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90.3%' }} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Premium Placements</span>
                      <span className="font-medium">{formatCurrency(1210)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '9.7%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaign analytics */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Campagne Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Actief</span>
                      <span className="font-medium">{analytics.campaigns.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voltooid</span>
                      <span className="font-medium">{analytics.campaigns.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gepauzeerd</span>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gem. CTR</span>
                      <span className="font-medium">{analytics.campaigns.avgCTR}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversie Rate</span>
                      <span className="font-medium">8.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gem. CPC</span>
                      <span className="font-medium">€0.21</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Utilizatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Besteed</span>
                      <span className="font-medium">{formatCurrency(analytics.revenue.current)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gereserveerd</span>
                      <span className="font-medium">{formatCurrency(8750)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '58.7%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Platform analytics */}
          <TabsContent value="platform" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Page Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.platform.pageViews)}</div>
                  <ChangeIndicator value={12340} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Unieke Bezoekers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.platform.uniqueVisitors)}</div>
                  <ChangeIndicator value={8920} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sessie Duur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(analytics.platform.avgSessionDuration)}</div>
                  <ChangeIndicator value={15} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bounce Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.platform.bounceRate}%</div>
                  <ChangeIndicator value={-2.3} isPercentage />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fact-check analytics */}
          <TabsContent value="factcheck" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recente Fact-Check Activiteit</CardTitle>
                <CardDescription>Analyses per dag en gemiddelde objectiviteitsscores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentAnalyses.map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString('nl-NL', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-500">{day.count} analyses</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{day.avgScore}%</p>
                        <p className="text-sm text-gray-500">Gem. score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}