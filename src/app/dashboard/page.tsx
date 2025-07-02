'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import AdvertiserLayout from '@/components/advertiser/advertiser-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Euro,
  Play,
  Pause,
  Plus,
  BarChart3,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  campaigns: {
    active: number;
    paused: number;
    completed: number;
    pending: number;
  };
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalSpent: number;
    averageCTR: number;
  };
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'pending';
    impressionsServed: number;
    impressionsPurchased: number;
    clicks: number;
    spent: number;
    ctr: number;
    lastActive: string;
  }>;
  balance: number;
  pendingActions: number;
}

const mockData: DashboardData = {
  campaigns: {
    active: 2,
    paused: 1,
    completed: 8,
    pending: 1
  },
  metrics: {
    totalImpressions: 125670,
    totalClicks: 3542,
    totalSpent: 4497,
    averageCTR: 2.82
  },
  recentCampaigns: [
    {
      id: '1',
      name: 'Product Launch Q1',
      status: 'active',
      impressionsServed: 24567,
      impressionsPurchased: 50000,
      clicks: 692,
      spent: 999,
      ctr: 2.82,
      lastActive: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'Brand Awareness Winter',
      status: 'active',
      impressionsServed: 8934,
      impressionsPurchased: 10000,
      clicks: 178,
      spent: 299,
      ctr: 1.99,
      lastActive: '2024-01-20T12:15:00Z'
    },
    {
      id: '3',
      name: 'Holiday Special Offer',
      status: 'completed',
      impressionsServed: 50000,
      impressionsPurchased: 50000,
      clicks: 1534,
      spent: 1499,
      ctr: 3.07,
      lastActive: '2024-01-15T18:45:00Z'
    }
  ],
  balance: 15600, // in cents
  pendingActions: 1
};

export default function AdvertiserDashboard() {
  const [data, setData] = useState<DashboardData>(mockData);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nl-NL').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'paused': return 'Gepauzeerd';
      case 'completed': return 'Voltooid';
      case 'pending': return 'Wachtend';
      default: return status;
    }
  };

  return (
    <AdvertiserLayout>
      <div className="space-y-8">
        {/* Welcome header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welkom terug!</h2>
          <p className="text-muted-foreground">
            Hier is een overzicht van je advertentiecampagnes en prestaties.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Campagnes</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.campaigns.active}</div>
              <p className="text-xs text-muted-foreground">
                {data.campaigns.pending} wachtend op goedkeuring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Impressies</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.metrics.totalImpressions)}</div>
              <p className="text-xs text-muted-foreground">
                Deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Klikken</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.metrics.totalClicks)}</div>
              <p className="text-xs text-muted-foreground">
                {data.metrics.averageCTR}% gemiddelde CTR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uitgegeven</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.metrics.totalSpent * 100)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(data.balance)} tegoed resterend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main content grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent campaigns */}
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recente Campagnes</CardTitle>
                  <CardDescription>
                    Je laatste advertentiecampagnes en hun prestaties
                  </CardDescription>
                </div>
                <Link href="/dashboard/campaigns">
                  <Button variant="outline" size="sm">
                    Alle campagnes
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatNumber(campaign.impressionsServed)} / {formatNumber(campaign.impressionsPurchased)} impressies</span>
                        <span>{campaign.clicks} klikken</span>
                        <span>{campaign.ctr}% CTR</span>
                        <span>{formatCurrency(campaign.spent * 100)} uitgegeven</span>
                      </div>
                      {campaign.status === 'active' && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${(campaign.impressionsServed / campaign.impressionsPurchased) * 100}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/campaigns/${campaign.id}`}>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                      {campaign.status === 'active' && (
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Snelle Acties</CardTitle>
              <CardDescription>
                Start nieuwe campagnes of beheer bestaande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/campaigns/new" className="block">
                <Button className="w-full justify-start h-auto py-4">
                  <Plus className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Nieuwe Campagne</div>
                    <div className="text-xs opacity-90">Start een nieuwe advertentiecampagne</div>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/billing" className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Euro className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Credits Kopen</div>
                    <div className="text-xs text-gray-600">Voeg tegoed toe aan je account</div>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/analytics" className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Analytics Bekijken</div>
                    <div className="text-xs text-gray-600">Gedetailleerde prestatie rapporten</div>
                  </div>
                </Button>
              </Link>

              {data.pendingActions > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Actie Vereist</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Je hebt {data.pendingActions} campagne die wacht op goedkeuring.
                  </p>
                  <Link href="/dashboard/campaigns?filter=pending">
                    <Button size="sm" variant="outline">
                      Bekijken
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance insights */}
        <Card>
          <CardHeader>
            <CardTitle>Prestatie Inzichten</CardTitle>
            <CardDescription>
              Tips om je campagnes te verbeteren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Sterke CTR</h4>
                  <p className="text-sm text-blue-700">
                    Je gemiddelde CTR van {data.metrics.averageCTR}% ligt boven het platform gemiddelde van 2.1%
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Eye className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Hoge Zichtbaarheid</h4>
                  <p className="text-sm text-green-700">
                    Je advertenties worden gemiddeld 5.2 seconden bekeken
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Groei Kans</h4>
                  <p className="text-sm text-purple-700">
                    Overweeg avondslots voor 15% hogere engagement
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdvertiserLayout>
  );
}