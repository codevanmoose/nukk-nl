import { Card, CardContent } from '@/components/ui/card';
import { Search, Brain, FileText } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Voer URL in',
      description: 'Plak een nu.nl artikel URL in het zoekveld'
    },
    {
      icon: Brain,
      title: 'AI Analyse',
      description: 'Onze AI analyseert het artikel op objectiviteit en bronnen'
    },
    {
      icon: FileText,
      title: 'Bekijk Resultaat',
      description: 'Krijg een gedetailleerd rapport met highlights en scores'
    }
  ];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hoe werkt het?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            In drie eenvoudige stappen krijg je inzicht in de objectiviteit van elk nu.nl artikel
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}