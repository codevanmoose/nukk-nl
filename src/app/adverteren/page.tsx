'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, Upload } from 'lucide-react';
import Link from 'next/link';
import { PublicPageLayout } from '@/components/layout/public-page-layout';

export default function AdverterenPage() {
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
      // For now, simulate API call
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
    <>
      <PublicPageLayout showUrlInput={false}>
        <div className="h-full overflow-y-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Adverteren op nukk.nl</h1>
              <p className="text-muted-foreground">
                Bereik een bewust en kritisch publiek met premium advertenties.
              </p>
            </div>

            {/* Quick Benefits */}
            <div className="space-y-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Premium Bereik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Adverteer voor een hoogopgeleid publiek dat waarde hecht aan objectieve informatie.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Full-Screen Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Wallpaper ads vullen het hele scherm voor maximale aandacht.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link href="/adverteren/boeken">
                <Button size="lg" className="w-full">
                  Bekijk advertentie opties →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PublicPageLayout>

      {/* Extended Content - Below the fold */}
      <div className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Pricing Tiers */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Advertentie Pakketten</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Day Pass</CardTitle>
                  <CardDescription>Perfect voor events & launches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">€299<span className="text-lg font-normal">/dag</span></p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      24 uur exposure
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Kies je tijdslots
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Basic analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Click tracking
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-600">
                <CardHeader>
                  <CardTitle>Week Package</CardTitle>
                  <CardDescription>Meest populair</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">€1.499<span className="text-lg font-normal">/week</span></p>
                    <p className="text-sm text-green-600">15% korting</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      7 dagen exposure
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Alle tijdslots
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      A/B testing (2 varianten)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Dedicated support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Weekly performance report
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Month Package</CardTitle>
                  <CardDescription>Maximale impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">€4.999<span className="text-lg font-normal">/maand</span></p>
                    <p className="text-sm text-green-600">25% korting</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      30 dagen exposure
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Priority time slots
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Unlimited A/B testing
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Real-time dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      White-glove service
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Start uw campagne</CardTitle>
              <CardDescription>
                Vul het formulier in en we nemen binnen 24 uur contact met u op
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitSuccess ? (
                <div className="text-center py-8">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Bedankt voor uw interesse!</h3>
                  <p className="text-muted-foreground">
                    We hebben uw aanvraag ontvangen en nemen spoedig contact op.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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
                      <Label htmlFor="contactName">Contactpersoon *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                      <Label htmlFor="phone">Telefoonnummer</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://"
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
                  </div>

                  <div>
                    <Label htmlFor="message">Bericht</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Vertel ons meer over uw campagne doelen..."
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

          {/* Footer CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Heeft u vragen? Bekijk onze{' '}
              <Link href="/adverteren/faq" className="text-blue-600 hover:underline">
                veelgestelde vragen
              </Link>{' '}
              of neem direct contact op via{' '}
              <a href="mailto:adverteren@nukk.nl" className="text-blue-600 hover:underline">
                adverteren@nukk.nl
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}