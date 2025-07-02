'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Advertenties', href: '/admin/ads', icon: Image },
  { name: 'Nieuwsbrief', href: '/admin/newsletter', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Instellingen', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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
            <Link href="/admin" className="text-xl font-bold">
              nukk.nl Admin
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
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
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:shadow-sm lg:border-r">
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/admin" className="text-xl font-bold">
            nukk.nl Admin
          </Link>
        </div>
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
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              JM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Jasper Moose</p>
              <p className="text-xs text-gray-500 truncate">admin@nukk.nl</p>
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
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>

            {/* Notification badge */}
            <Button variant="ghost" size="icon" className="relative">
              <AlertCircle className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
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