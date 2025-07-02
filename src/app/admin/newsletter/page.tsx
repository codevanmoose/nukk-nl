'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Mail,
  Send,
  Download,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Newsletter {
  id: string;
  subject: string;
  previewText: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  source: string;
  subscribedAt: string;
  confirmedAt?: string;
  lastActivity?: string;
}

const mockNewsletters: Newsletter[] = [
  {
    id: '1',
    subject: 'Weekly Fact-Check Roundup #47',
    previewText: 'Deze week: misleidende claims over klimaatverandering en AI-desinformatie',
    status: 'sent',
    recipientCount: 2847,
    openRate: 67.3,
    clickRate: 12.8,
    sentAt: '2024-01-20T09:00:00Z',
    createdAt: '2024-01-19T14:30:00Z'
  },
  {
    id: '2',
    subject: 'Platform Update: Nieuwe AI Moderatie Features',
    previewText: 'Ontdek onze verbeterde fact-checking algoritmes en nieuwe functionaliteiten',
    status: 'scheduled',
    recipientCount: 2853,
    scheduledFor: '2024-01-27T09:00:00Z',
    createdAt: '2024-01-20T16:45:00Z'
  },
  {
    id: '3',
    subject: 'Weekly Fact-Check Roundup #48',
    previewText: 'Concept voor aankomende week...',
    status: 'draft',
    recipientCount: 0,
    createdAt: '2024-01-21T10:15:00Z'
  }
];

const mockSubscribers: Subscriber[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    status: 'confirmed',
    source: 'website',
    subscribedAt: '2024-01-15T10:30:00Z',
    confirmedAt: '2024-01-15T11:15:00Z',
    lastActivity: '2024-01-20T09:05:00Z'
  },
  {
    id: '2',
    email: 'maria.smith@company.nl',
    status: 'confirmed',
    source: 'website',
    subscribedAt: '2024-01-18T14:20:00Z',
    confirmedAt: '2024-01-18T15:30:00Z',
    lastActivity: '2024-01-20T09:12:00Z'
  },
  {
    id: '3',
    email: 'newsletter@fan.nl',
    status: 'pending',
    source: 'website',
    subscribedAt: '2024-01-20T16:45:00Z'
  }
];

export default function NewsletterManagement() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(mockNewsletters);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
  const [searchTerm, setSearchTerm] = useState('');

  const subscriberStats = {
    total: subscribers.length,
    confirmed: subscribers.filter(s => s.status === 'confirmed').length,
    pending: subscribers.filter(s => s.status === 'pending').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    growth: '+12.5%' // Mock growth rate
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unsubscribed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Concept';
      case 'scheduled': return 'Gepland';
      case 'sent': return 'Verzonden';
      case 'confirmed': return 'Bevestigd';
      case 'pending': return 'Wachtend';
      case 'unsubscribed': return 'Uitgeschreven';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nieuwsbrief Beheer</h2>
            <p className="text-muted-foreground">
              Beheer abonnees en nieuwsbriefcampagnes
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Nieuwsbrief
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Abonnees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriberStats.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{subscriberStats.growth}</span> deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Abonnees</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriberStats.confirmed}</div>
              <p className="text-xs text-muted-foreground">
                {subscriberStats.pending} wachten op bevestiging
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gemiddelde Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67.3%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% vs vorige maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.8%</div>
              <p className="text-xs text-muted-foreground">
                +0.8% vs vorige maand
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for newsletters and subscribers */}
        <Tabs defaultValue="newsletters" className="space-y-4">
          <TabsList>
            <TabsTrigger value="newsletters">Nieuwsbrieven</TabsTrigger>
            <TabsTrigger value="subscribers">Abonnees</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Newsletters tab */}
          <TabsContent value="newsletters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nieuwsbrieven</CardTitle>
                <CardDescription>
                  Beheer al je nieuwsbriefcampagnes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{newsletter.subject}</h3>
                          <Badge className={getStatusColor(newsletter.status)}>
                            {getStatusText(newsletter.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{newsletter.previewText}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {newsletter.status === 'sent' && newsletter.sentAt && (
                              <>Verzonden: {new Date(newsletter.sentAt).toLocaleDateString('nl-NL')}</>
                            )}
                            {newsletter.status === 'scheduled' && newsletter.scheduledFor && (
                              <>Gepland: {new Date(newsletter.scheduledFor).toLocaleDateString('nl-NL')}</>
                            )}
                            {newsletter.status === 'draft' && (
                              <>Gemaakt: {new Date(newsletter.createdAt).toLocaleDateString('nl-NL')}</>
                            )}
                          </span>
                          {newsletter.recipientCount > 0 && (
                            <span>{newsletter.recipientCount} ontvangers</span>
                          )}
                          {newsletter.openRate && (
                            <span>{newsletter.openRate}% geopend</span>
                          )}
                          {newsletter.clickRate && (
                            <span>{newsletter.clickRate}% geklikt</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        {newsletter.status === 'draft' && (
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Bewerken
                          </Button>
                        )}
                        {newsletter.status === 'sent' && (
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Rapport
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers tab */}
          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Abonnees</CardTitle>
                    <CardDescription>
                      Beheer al je nieuwsbrief abonnees
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Zoek abonnees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3 font-medium">E-mail</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Bron</th>
                        <th className="text-left p-3 font-medium">Aangemeld</th>
                        <th className="text-left p-3 font-medium">Laatste Activiteit</th>
                        <th className="text-right p-3 font-medium">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{subscriber.email}</td>
                          <td className="p-3">
                            <Badge className={getStatusColor(subscriber.status)}>
                              {getStatusText(subscriber.status)}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600 capitalize">{subscriber.source}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(subscriber.subscribedAt).toLocaleDateString('nl-NL')}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {subscriber.lastActivity 
                              ? new Date(subscriber.lastActivity).toLocaleDateString('nl-NL')
                              : '-'
                            }
                          </td>
                          <td className="p-3 text-right">
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>E-mail Templates</CardTitle>
                <CardDescription>
                  Beheer templates voor automatische e-mails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Welkomstmail</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Automatisch verzonden na aanmelding
                    </p>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Bewerken
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Bevestigingsmail</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      E-mail adres bevestigen
                    </p>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Bewerken
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Weekly Roundup</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Wekelijkse nieuwsbrief template
                    </p>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Bewerken
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}