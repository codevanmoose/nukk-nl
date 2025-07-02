import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, CheckCircle, Clock, Users } from 'lucide-react';

export default function TrustIndicators() {
  const indicators = [
    {
      icon: BarChart3,
      value: '95%',
      label: 'Nauwkeurigheid',
      description: 'AI accuraatheid'
    },
    {
      icon: CheckCircle,
      value: '1,000+',
      label: 'Analyses',
      description: 'Artikelen gecheckt'
    },
    {
      icon: Clock,
      value: '<5s',
      label: 'Snelheid',
      description: 'Gemiddelde analyse tijd'
    },
    {
      icon: Users,
      value: '500+',
      label: 'Gebruikers',
      description: 'Actieve fact-checkers'
    }
  ];

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vertrouwd door kritische lezers
          </h2>
          <p className="text-xl text-muted-foreground">
            Onze AI-technologie helpt duizenden Nederlanders dagelijks bij het beoordelen van nieuws
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((indicator, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <indicator.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {indicator.value}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {indicator.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {indicator.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}