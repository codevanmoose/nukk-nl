'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, Upload, X } from 'lucide-react';

interface AdverterenContentProps {
  onClose: () => void;
}

export default function AdverterenContent({ onClose }: AdverterenContentProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // TODO: Implement actual submission to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Advertiser submission:', formData);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        budget: '',
        message: ''
      });
    } catch (error) {
      setSubmitError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="relative w-full h-full bg-white overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        aria-label="Sluiten"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Adverteren op nukk.nl</h1>
          <p className="text-lg text-muted-foreground">
            Bereik een bewust en kritisch publiek met premium advertenties
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Day Pass</CardTitle>
              <CardDescription>Perfect voor events & launches</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">€299<span className="text-sm font-normal">/dag</span></p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  24 uur exposure
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Basic analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Week Package</CardTitle>
              <CardDescription>Meest populair - 15% korting</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">€1.499<span className="text-sm font-normal">/week</span></p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  7 dagen exposure
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  A/B testing
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Start uw campagne</CardTitle>
            <CardDescription>
              Vul het formulier in voor een op maat gemaakt voorstel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitSuccess ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Bedankt!</h3>
                <p className="text-muted-foreground">
                  We nemen binnen 24 uur contact op.
                </p>
                <Button 
                  onClick={() => setSubmitSuccess(false)} 
                  className="mt-4"
                >
                  Nog een aanvraag
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Bedrijfsnaam *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mailadres *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget indicatie</Label>
                  <Input
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="€1.000 - €5.000 per maand"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Bericht</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Vertel ons over uw campagne..."
                  />
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {submitError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Verzenden...
                    </>
                  ) : (
                    'Verstuur aanvraag'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contact info */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            Direct contact?{' '}
            <a href="mailto:adverteren@nukk.nl" className="text-blue-600 hover:underline">
              adverteren@nukk.nl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}