'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Filter,
  Search,
  Eye,
  Check,
  X,
  Play,
  Pause,
  MoreHorizontal,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdCampaign {
  id: string;
  advertiser: string;
  companyName: string;
  campaignName: string;
  status: 'pending' | 'ai_review' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed';
  aiModerationScore: number;
  impressionsBought: number;
  impressionsServed: number;
  budget: number;
  clickUrl: string;
  imageUrl: string;
  createdAt: string;
  lastModified: string;
}

const mockCampaigns: AdCampaign[] = [
  {
    id: '1',
    advertiser: 'john@techstartup.nl',
    companyName: 'Tech Startup NL',
    campaignName: 'Product Launch Campaign',
    status: 'pending',
    aiModerationScore: 0.75,
    impressionsBought: 10000,
    impressionsServed: 0,
    budget: 299,
    clickUrl: 'https://techstartup.nl/launch',
    imageUrl: '/api/placeholder/1920/1080',
    createdAt: '2024-01-20T10:30:00Z',
    lastModified: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    advertiser: 'maria@creative.nl',
    companyName: 'Creative Agency',
    campaignName: 'Brand Awareness Q1',
    status: 'active',
    aiModerationScore: 0.92,
    impressionsBought: 50000,
    impressionsServed: 12450,
    budget: 1499,
    clickUrl: 'https://creative.nl/services',
    imageUrl: '/api/placeholder/1920/1080',
    createdAt: '2024-01-15T14:20:00Z',
    lastModified: '2024-01-18T09:15:00Z'
  },
  {
    id: '3',
    advertiser: 'info@mediaco.nl',
    companyName: 'Media Company BV',
    campaignName: 'Winter Sale Promotion',
    status: 'ai_review',
    aiModerationScore: 0.68,
    impressionsBought: 25000,
    impressionsServed: 0,
    budget: 749,
    clickUrl: 'https://mediaco.nl/sale',
    imageUrl: '/api/placeholder/1920/1080',
    createdAt: '2024-01-19T16:45:00Z',
    lastModified: '2024-01-19T16:45:00Z'
  }
];

export default function AdsManagement() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('filter') || 'all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.advertiser.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ai_review': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Wachtend';
      case 'ai_review': return 'AI Review';
      case 'approved': return 'Goedgekeurd';
      case 'rejected': return 'Afgewezen';
      case 'active': return 'Actief';
      case 'paused': return 'Gepauzeerd';
      case 'completed': return 'Voltooid';
      default: return status;
    }
  };

  const handleApprove = (id: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, status: 'approved' as const } : campaign
    ));
  };

  const handleReject = (id: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, status: 'rejected' as const } : campaign
    ));
  };

  const handlePause = (id: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { 
        ...campaign, 
        status: campaign.status === 'paused' ? 'active' as const : 'paused' as const 
      } : campaign
    ));
  };

  const statusCounts = {
    all: campaigns.length,
    pending: campaigns.filter(c => c.status === 'pending').length,
    ai_review: campaigns.filter(c => c.status === 'ai_review').length,
    active: campaigns.filter(c => c.status === 'active').length,
    approved: campaigns.filter(c => c.status === 'approved').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    rejected: campaigns.filter(c => c.status === 'rejected').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Advertentie Beheer</h2>
            <p className="text-muted-foreground">
              Beheer alle advertentiecampagnes en moderatie
            </p>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Zoek adverteerders, campagnes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="all">Alle ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending" className="text-yellow-600">
              Wachtend ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="ai_review" className="text-orange-600">
              AI Review ({statusCounts.ai_review})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-blue-600">
              Actief ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-green-600">
              Goedgekeurd ({statusCounts.approved})
            </TabsTrigger>
            <TabsTrigger value="paused" className="text-gray-600">
              Gepauzeerd ({statusCounts.paused})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-purple-600">
              Voltooid ({statusCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-red-600">
              Afgewezen ({statusCounts.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            {/* Campaigns table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-medium">Adverteerder</th>
                        <th className="text-left p-4 font-medium">Campagne</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">AI Score</th>
                        <th className="text-left p-4 font-medium">Progress</th>
                        <th className="text-left p-4 font-medium">Budget</th>
                        <th className="text-left p-4 font-medium">Gemaakt</th>
                        <th className="text-right p-4 font-medium">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{campaign.companyName}</p>
                              <p className="text-sm text-gray-500">{campaign.advertiser}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={campaign.imageUrl} 
                                alt="Ad preview"
                                className="w-12 h-8 object-cover rounded border"
                              />
                              <div>
                                <p className="font-medium">{campaign.campaignName}</p>
                                <a 
                                  href={campaign.clickUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  {campaign.clickUrl}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusText(campaign.status)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                campaign.aiModerationScore >= 0.8 ? 'bg-green-500' :
                                campaign.aiModerationScore >= 0.6 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                              <span className="text-sm">
                                {Math.round(campaign.aiModerationScore * 100)}%
                              </span>
                              {campaign.aiModerationScore < 0.8 && (
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="w-24">
                              <div className="text-xs text-gray-500 mb-1">
                                {campaign.impressionsServed.toLocaleString('nl-NL')} / {campaign.impressionsBought.toLocaleString('nl-NL')}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ 
                                    width: `${(campaign.impressionsServed / campaign.impressionsBought) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">€{campaign.budget}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-500">
                              {new Date(campaign.createdAt).toLocaleDateString('nl-NL')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {(campaign.status === 'pending' || campaign.status === 'ai_review') && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApprove(campaign.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(campaign.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              
                              {(campaign.status === 'active' || campaign.status === 'paused') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePause(campaign.id)}
                                >
                                  {campaign.status === 'paused' ? (
                                    <Play className="w-4 h-4" />
                                  ) : (
                                    <Pause className="w-4 h-4" />
                                  )}
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acties</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Details bekijken
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Preview advertentie
                                  </DropdownMenuItem>
                                  {campaign.status === 'rejected' && (
                                    <DropdownMenuItem onClick={() => handleApprove(campaign.id)}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Alsnog goedkeuren
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}