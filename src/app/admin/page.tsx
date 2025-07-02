'use client';

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
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  revenue: {
    total: number;
    change: number;
  };
  advertisers: {
    total: number;
    active: number;
    change: number;
  };
  campaigns: {
    active: number;
    pending: number;
    total: number;
  };
  impressions: {
    today: number;
    change: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: { total: 12450, change: 15.3 },
    advertisers: { total: 24, active: 18, change: 8.2 },
    campaigns: { active: 12, pending: 3, total: 45 },
    impressions: { today: 24567, change: -5.4 }
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'new_campaign', advertiser: 'Tech Startup NL', time: '2 uur geleden' },
    { id: 2, type: 'payment', advertiser: 'Creative Agency', amount: 1499, time: '5 uur geleden' },
    { id: 3, type: 'approval_needed', advertiser: 'Media Company BV', time: '8 uur geleden' },
    { id: 4, type: 'campaign_completed', advertiser: 'E-commerce Plus', time: '1 dag geleden' },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welkom terug! Hier is een overzicht van je platform.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Revenue card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.revenue.total.toLocaleString('nl-NL')}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.revenue.change > 0 ? (
                  <>
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">+{stats.revenue.change}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                    <span className="text-red-500">{stats.revenue.change}%</span>
                  </>
                )}
                <span>deze maand</span>
              </p>
            </CardContent>
          </Card>

          {/* Advertisers card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adverteerders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.advertisers.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.advertisers.active} actief, {stats.advertisers.change > 0 ? '+' : ''}{stats.advertisers.change}% groei
              </p>
            </CardContent>
          </Card>

          {/* Active campaigns card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.campaigns.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.campaigns.pending} wachten op goedkeuring
              </p>
            </CardContent>
          </Card>

          {/* Impressions card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressies Vandaag</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.impressions.today.toLocaleString('nl-NL')}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.impressions.change > 0 ? (
                  <>
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">+{stats.impressions.change}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                    <span className="text-red-500">{stats.impressions.change}%</span>
                  </>
                )}
                <span>vs gisteren</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity and quick actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent activity */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recente Activiteit</CardTitle>
              <CardDescription>
                Laatste acties op het platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        activity.type === 'approval_needed' ? 'bg-yellow-500' :
                        activity.type === 'new_campaign' ? 'bg-blue-500' :
                        activity.type === 'payment' ? 'bg-green-500' :
                        'bg-gray-500'
                      )} />
                      <div>
                        <p className="text-sm font-medium">
                          {activity.type === 'new_campaign' && `Nieuwe campagne: ${activity.advertiser}`}
                          {activity.type === 'payment' && `Betaling ontvangen: €${activity.amount}`}
                          {activity.type === 'approval_needed' && `Goedkeuring vereist: ${activity.advertiser}`}
                          {activity.type === 'campaign_completed' && `Campagne voltooid: ${activity.advertiser}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    {activity.type === 'approval_needed' && (
                      <Link href="/admin/ads">
                        <Button size="sm" variant="outline">
                          Bekijken
                        </Button>
                      </Link>
                    )}
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
                Veelgebruikte taken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/ads?filter=pending" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                  Advertenties beoordelen (3)
                </Button>
              </Link>
              <Link href="/admin/newsletter/compose" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Nieuwsbrief opstellen
                </Button>
              </Link>
              <Link href="/admin/analytics" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics bekijken
                </Button>
              </Link>
              <Link href="/admin/settings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Platform instellingen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pending approvals alert */}
        {stats.campaigns.pending > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <CardTitle className="text-lg">Actie Vereist</CardTitle>
                </div>
                <Link href="/admin/ads?filter=pending">
                  <Button size="sm">
                    Bekijk alle
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-800">
                Er zijn {stats.campaigns.pending} advertenties die wachten op goedkeuring. 
                AI-moderatie heeft deze geflagged voor handmatige review.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

// Helper function (should be imported from utils)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}