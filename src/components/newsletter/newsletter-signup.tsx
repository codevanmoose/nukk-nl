'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check, AlertCircle } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const data = await response.json();
        setStatus('error');
        setErrorMessage(data.error || 'Er is iets misgegaan');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Netwerkfout. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Blijf op de hoogte</CardTitle>
        <CardDescription>
          Ontvang wekelijks de meest interessante fact-checks en analyses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'success' ? (
          <div className="text-center py-4">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 font-medium">Succesvol aangemeld!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check je inbox voor een bevestigingsmail
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <>
                  <Mail className="w-4 h-4 mr-2 animate-pulse" />
                  Aanmelden...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Aanmelden voor nieuwsbrief
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Door je aan te melden ga je akkoord met ons{' '}
              <a href="/privacy" className="underline">
                privacybeleid
              </a>
              . Je kunt je altijd uitschrijven.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}