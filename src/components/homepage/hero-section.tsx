'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { isValidNuUrl } from '@/utils/url-validation';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Voer een nu.nl URL in');
      return;
    }

    if (!isValidNuUrl(url)) {
      setError('Voer een geldige nu.nl URL in (bijv. https://www.nu.nl/artikel)');
      return;
    }

    setIsLoading(true);
    try {
      // Redirect to analysis page
      const encodedUrl = encodeURIComponent(url);
      router.push(`/analyse?url=${encodedUrl}`);
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-4xl text-center space-y-8">
        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Check <span className="text-blue-600">nu.nl</span> artikelen op feiten
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Ontdek waar mening als feit wordt gepresenteerd met onze AI-powered fact-checker
          </p>
        </div>

        {/* URL Input Form */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="Plak hier een nu.nl artikel URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 text-lg"
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-red-500 text-left">{error}</p>
                )}
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Analyseren...' : 'Analyseer artikel'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Example */}
        <div className="text-sm text-muted-foreground">
          <p>Voorbeeld: https://www.nu.nl/politiek/6123456/artikel-titel</p>
        </div>
      </div>
    </div>
  );
}