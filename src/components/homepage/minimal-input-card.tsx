'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { isValidNuUrl } from '@/utils/url-validation';
import { useRouter } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

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
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6">
          <span className="text-white font-bold text-lg">nk</span>
        </div>
        
        <h1 className="text-2xl mb-2">
          You&apos;re <span className="font-bold">almost</span><br />
          there
        </h1>
        
        <p className="text-gray-600 text-sm mt-4">
          To continue, please paste your<br />
          nu.nl article URL below
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="url"
            placeholder="https://www.nu.nl/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full h-14 px-4 pr-14 border-2 border-gray-200 rounded-full text-base placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-1 top-1 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            disabled={isLoading || !url.trim()}
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {error && (
          <p className="text-sm text-red-500 ml-4">{error}</p>
        )}
      </form>

      {/* Bottom button */}
      <div className="mt-12">
        <Button 
          variant="default"
          size="lg"
          className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? 'Analyseren...' : 'I agree'}
        </Button>
      </div>
    </div>
  );
}