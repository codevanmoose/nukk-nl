'use client';

import { useState } from 'react';
import AdvertiserLayout from '@/components/advertiser/advertiser-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { IMPRESSION_PACKAGES, PackageId } from '@/lib/stripe';
import { Badge } from '@/components/ui/badge';

interface CampaignForm {
  name: string;
  description: string;
  clickUrl: string;
  selectedPackage: PackageId | '';
  adCreative: {
    file: File | null;
    imageUrl: string;
    backgroundColor: string;
    textColor: string;
  };
}

export default function NewCampaign() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [aiModerationResult, setAiModerationResult] = useState<{
    score: number;
    flags: string[];
    approved: boolean;
  } | null>(null);
  
  const [form, setForm] = useState<CampaignForm>({
    name: '',
    description: '',
    clickUrl: '',
    selectedPackage: '',
    adCreative: {
      file: null,
      imageUrl: '',
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, file: 'Alleen JPG, PNG en WebP bestanden zijn toegestaan' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setErrors({ ...errors, file: 'Bestand mag maximaal 5MB zijn' });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      
      setForm(prev => ({
        ...prev,
        adCreative: {
          ...prev.adCreative,
          file,
          imageUrl
        }
      }));

      // Simulate AI moderation (in production, this would be a real API call)
      setTimeout(() => {
        const mockModerationResult = {
          score: 0.92,
          flags: [],
          approved: true
        };
        setAiModerationResult(mockModerationResult);
        setIsUploading(false);
      }, 2000);

    } catch (error) {
      setErrors({ ...errors, file: 'Fout bij uploaden van bestand' });
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!form.name) newErrors.name = 'Campagne naam is verplicht';
      if (!form.clickUrl) newErrors.clickUrl = 'Bestemming URL is verplicht';
      if (form.clickUrl && !form.clickUrl.startsWith('http')) {
        newErrors.clickUrl = 'URL moet beginnen met http:// of https://';
      }
    }

    if (stepNumber === 2) {
      if (!form.adCreative.file) newErrors.file = 'Upload een advertentie afbeelding';
    }

    if (stepNumber === 3) {
      if (!form.selectedPackage) newErrors.package = 'Selecteer een impressie pakket';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    // Create campaign and redirect to payment
    console.log('Creating campaign:', form);
    // Implementation would create campaign in database and redirect to payment
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Campagne Naam *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Bijv. Product Launch Q1 2024"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Beschrijving (optioneel)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Beschrijf je campagne doelen..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="clickUrl">Bestemming URL *</Label>
              <Input
                id="clickUrl"
                type="url"
                value={form.clickUrl}
                onChange={(e) => handleInputChange('clickUrl', e.target.value)}
                placeholder="https://jouwwebsite.nl/landing-page"
                className={errors.clickUrl ? 'border-red-500' : ''}
              />
              {errors.clickUrl && <p className="text-sm text-red-500 mt-1">{errors.clickUrl}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Waar moeten gebruikers naartoe als ze op je advertentie klikken?
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Ad specifications */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Info className="w-5 h-5" />
                  Advertentie Specificaties
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Technische Vereisten:</h4>
                    <ul className="space-y-1">
                      <li>• Formaat: JPG, PNG, of WebP</li>
                      <li>• Bestandsgrootte: Max 5MB</li>
                      <li>• Resolutie: 1920x1080 aanbevolen</li>
                      <li>• Aspect ratio: 16:9 of 16:10</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Content Richtlijnen:</h4>
                    <ul className="space-y-1">
                      <li>• Geen adult content</li>
                      <li>• Geen geweld of haat</li>
                      <li>• Geen misleidende claims</li>
                      <li>• Respecteer auteursrechten</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File upload */}
            <div>
              <Label>Advertentie Afbeelding *</Label>
              <div className="mt-2">
                {!form.adCreative.imageUrl ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Sleep je afbeelding hier of klik om te uploaden
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG of WebP tot 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={form.adCreative.imageUrl}
                      alt="Uploaded ad"
                      className="w-full max-w-md mx-auto rounded-lg border"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                          <p>AI moderatie bezig...</p>
                        </div>
                      </div>
                    )}
                    {aiModerationResult && (
                      <div className="mt-4 p-4 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">AI Moderatie Geslaagd</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Score: {Math.round(aiModerationResult.score * 100)}% - Advertentie voldoet aan alle richtlijnen
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
            </div>

            {/* Color customization */}
            {form.adCreative.imageUrl && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Achtergrond Kleur</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={form.adCreative.backgroundColor}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adCreative: { ...prev.adCreative, backgroundColor: e.target.value }
                      }))}
                      className="w-10 h-10 rounded border"
                    />
                    <Input
                      value={form.adCreative.backgroundColor}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adCreative: { ...prev.adCreative, backgroundColor: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="textColor">Tekst Kleur</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="textColor"
                      value={form.adCreative.textColor}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adCreative: { ...prev.adCreative, textColor: e.target.value }
                      }))}
                      className="w-10 h-10 rounded border"
                    />
                    <Input
                      value={form.adCreative.textColor}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        adCreative: { ...prev.adCreative, textColor: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kies je Impressie Pakket</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(IMPRESSION_PACKAGES).map(([packageId, pkg]) => (
                  <Card
                    key={packageId}
                    className={`cursor-pointer transition-all ${
                      form.selectedPackage === packageId
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setForm(prev => ({ ...prev, selectedPackage: packageId as PackageId }))}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {pkg.name}
                        {form.selectedPackage === packageId && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xl font-bold">
                        €{pkg.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-2 bg-gray-50 rounded text-sm text-center">
                        €{(pkg.priceInCents / pkg.impressions * 1000 / 100).toFixed(2)} CPM
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {errors.package && <p className="text-sm text-red-500 mt-2">{errors.package}</p>}
            </div>

            {/* Campaign summary */}
            {form.selectedPackage && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle>Campagne Overzicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Campagne naam:</span>
                      <span className="font-medium">{form.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bestemming URL:</span>
                      <span className="font-medium">{form.clickUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pakket:</span>
                      <span className="font-medium">{IMPRESSION_PACKAGES[form.selectedPackage].name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impressies:</span>
                      <span className="font-medium">{IMPRESSION_PACKAGES[form.selectedPackage].impressions.toLocaleString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-medium">Totaal:</span>
                      <span className="font-bold">€{IMPRESSION_PACKAGES[form.selectedPackage].price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Campagne Details';
      case 2: return 'Advertentie Upload';
      case 3: return 'Pakket & Betaling';
      default: return '';
    }
  };

  return (
    <AdvertiserLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nieuwe Campagne</h2>
          <p className="text-muted-foreground">
            Maak een nieuwe advertentiecampagne in 3 eenvoudige stappen
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Vorige
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext}>
              Volgende
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Doorgaan naar Betaling
            </Button>
          )}
        </div>
      </div>
    </AdvertiserLayout>
  );
}