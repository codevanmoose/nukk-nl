'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidNuUrl } from '@/utils/url-validation';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function MinimalInputCard() {
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
      setError('Voer een geldige nu.nl URL in');
      return;
    }

    setIsLoading(true);
    try {
      const encodedUrl = encodeURIComponent(url);
      router.push(`/analyse?url=${encodedUrl}`);
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo and tagline */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">nukk.nl</h1>
        <p className="text-gray-600 text-sm">
          AI-powered fact-checking voor nu.nl
        </p>
      </div>

      {/* Input card */}
      <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url-input" className="text-sm font-medium text-gray-700">
              Artikel URL
            </label>
            <div className="relative">
              <Input
                id="url-input"
                type="url"
                placeholder="https://www.nu.nl/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 pr-10 border-gray-200 focus:border-blue-500 rounded-xl"
                disabled={isLoading}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyseren...
              </span>
            ) : (
              'Analyseer artikel'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Check waar mening als feit wordt gepresenteerd
          </p>
        </div>
      </div>

      {/* Bottom link */}
      <div className="mt-8 text-center">
        <a 
          href="#how-it-works" 
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Hoe werkt het?
        </a>
      </div>
    </div>
  );
}