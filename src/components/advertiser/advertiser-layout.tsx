'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Euro
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdvertiserLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campagnes', href: '/dashboard/campaigns', icon: Image },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Facturen', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Instellingen', href: '/dashboard/settings', icon: Settings },
];

export default function AdvertiserLayout({ children }: AdvertiserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Mock advertiser data - in production, this would come from auth/API
  const advertiser = {
    companyName: 'Tech Startup NL',
    email: 'john@techstartup.nl',
    balance: 15600, // in cents
    activeCampaigns: 2
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              nukk.nl
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Mobile navigation */}
          <nav className="mt-8 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile account info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="text-center mb-3">
              <p className="text-sm font-medium">{advertiser.companyName}</p>
              <p className="text-xs text-gray-500">{advertiser.email}</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:shadow-sm lg:border-r">
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            nukk.nl
          </Link>
        </div>

        {/* Account balance card */}
        <div className="m-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Tegoed</span>
            <Euro className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-900">
            €{(advertiser.balance / 100).toFixed(2)}
          </p>
          <Link href="/dashboard/billing">
            <Button size="sm" className="w-full mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Credits Kopen
            </Button>
          </Link>
        </div>

        <nav className="mt-4 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
                {item.name === 'Campagnes' && advertiser.activeCampaigns > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {advertiser.activeCampaigns}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {advertiser.companyName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{advertiser.companyName}</p>
              <p className="text-xs text-gray-500 truncate">{advertiser.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="w-4 h-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Adverteerder Dashboard</h1>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                {advertiser.activeCampaigns} actieve campagnes
              </Badge>
              <Link href="/dashboard/campaigns/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe Campagne
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}