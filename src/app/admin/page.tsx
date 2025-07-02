'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Euro, 
  Image,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertCircle,
  Mail,
  BarChart3,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalRevenue: number;
  totalCampaigns: number;
  activeAds: number;
  newsletterSubscribers: number;
  revenueChange: number;
  campaignsChange: number;
  adsChange: number;
  subscribersChange: number;
}

interface RecentActivity {
  id: string;
  type: 'campaign_created' | 'payment_received' | 'ad_approved' | 'ad_rejected';
  description: string;
  timestamp: string;
  amount?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 12750,
    totalCampaigns: 23,
    activeAds: 8,
    newsletterSubscribers: 1204,
    revenueChange: 12.5,
    campaignsChange: 8.2,
    adsChange: -2.1,
    subscribersChange: 5.7
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'payment_received',
      description: 'Payment received from Tech Startup NL',
      timestamp: '2024-01-20T10:30:00Z',
      amount: 999
    },
    {
      id: '2',
      type: 'ad_approved',
      description: 'Ad approved for Media Company BV campaign',
      timestamp: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      type: 'campaign_created',
      description: 'New campaign created by Creative Agency',
      timestamp: '2024-01-20T08:45:00Z'
    },
    {
      id: '4',
      type: 'ad_rejected',
      description: 'Ad rejected for violation of content policy',
      timestamp: '2024-01-19T16:30:00Z'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nl-NL').format(num);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <Euro className="h-4 w-4 text-green-600" />;
      case 'ad_approved':
        return <Image className="h-4 w-4 text-blue-600" />;
      case 'campaign_created':
        return <Activity className="h-4 w-4 text-purple-600" />;
      case 'ad_rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'payment_received':
        return 'bg-green-100 text-green-800';
      case 'ad_approved':
        return 'bg-blue-100 text-blue-800';
      case 'campaign_created':
        return 'bg-purple-100 text-purple-800';
      case 'ad_rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overzicht van je advertentieplatform prestaties
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.revenueChange > 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                )}
                {Math.abs(stats.revenueChange)}% t.o.v. vorige maand
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Campagnes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalCampaigns)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.campaignsChange > 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                )}
                {Math.abs(stats.campaignsChange)}% t.o.v. vorige maand
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Advertenties</CardTitle>
              <img alt="" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.activeAds)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.adsChange > 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                )}
                {Math.abs(stats.adsChange)}% t.o.v. vorige maand
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nieuwsbrief Abonnees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.newsletterSubscribers)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.subscribersChange > 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                )}
                {Math.abs(stats.subscribersChange)}% t.o.v. vorige maand
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recente Activiteit</CardTitle>
              <CardDescription>
                Laatste updates van je advertentieplatform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString('nl-NL', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    {activity.amount && (
                      <div className="text-sm font-medium text-green-600">
                        +{formatCurrency(activity.amount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Snelle Acties</CardTitle>
              <CardDescription>
                Veelgebruikte admin taken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/ads" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Advertenties Modereren
                </Button>
              </Link>
              
              <Link href="/admin/newsletter" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Nieuwsbrief Versturen
                </Button>
              </Link>
              
              <Link href="/admin/analytics" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics Bekijken
                </Button>
              </Link>
              
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Platform Instellingen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Health Alert */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Platform Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-orange-800">
              Alle systemen operationeel. Advertentieplatform draait optimaal met 99.9% uptime.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}