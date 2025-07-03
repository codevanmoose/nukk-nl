'use client';

import { useState } from 'react';
import { Annotation } from '@/types';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AnalysisHighlightsProps {
  text: string;
  annotations: Annotation[];
}

const typeColors = {
  fact: 'bg-green-100 text-green-900 border-green-300',
  opinion: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  suggestive: 'bg-orange-100 text-orange-900 border-orange-300',
  incomplete: 'bg-red-100 text-red-900 border-red-300',
};

const typeLabels = {
  fact: 'Feit',
  opinion: 'Mening',
  suggestive: 'Suggestief',
  incomplete: 'Onvolledig',
};

export function AnalysisHighlights({ text, annotations }: AnalysisHighlightsProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  // Sort annotations by start position
  const sortedAnnotations = [...annotations].sort((a, b) => a.start_index - b.start_index);

  // Build the highlighted text
  const renderHighlightedText = () => {
    if (annotations.length === 0) {
      return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((annotation, index) => {
      // Add text before annotation
      if (annotation.start_index > lastIndex) {
        elements.push(
          <span key={`text-${index}`} className="text-gray-700">
            {text.slice(lastIndex, annotation.start_index)}
          </span>
        );
      }

      // Add highlighted annotation
      const annotationText = text.slice(annotation.start_index, annotation.end_index);
      const isActive = activeAnnotation === annotation.id;
      
      elements.push(
        <TooltipProvider key={`annotation-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`
                  inline-block px-1 py-0.5 mx-0.5 rounded border cursor-help
                  transition-all duration-200
                  ${typeColors[annotation.type]}
                  ${isActive ? 'ring-2 ring-offset-1 ring-blue-500' : ''}
                `}
                onMouseEnter={() => setActiveAnnotation(annotation.id)}
                onMouseLeave={() => setActiveAnnotation(null)}
              >
                {annotationText}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[annotation.type]}`}>
                    {typeLabels[annotation.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(annotation.confidence * 100)}% zekerheid
                  </span>
                </div>
                <p className="text-sm">{annotation.reasoning}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = annotation.end_index;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-final" className="text-gray-700">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <div className="leading-relaxed whitespace-pre-wrap">{elements}</div>;
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Legenda:</span>
        </div>
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className={`inline-block w-4 h-4 rounded border ${
                typeColors[type as keyof typeof typeColors]
              }`}
            />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Annotation details */}
      {annotations.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Gedetailleerde bevindingen:</h4>
          <div className="space-y-2">
            {sortedAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${activeAnnotation === annotation.id ? 'ring-2 ring-blue-500' : ''}
                  ${typeColors[annotation.type].replace('text-', 'bg-').replace('900', '50')}
                `}
                onMouseEnter={() => setActiveAnnotation(annotation.id)}
                onMouseLeave={() => setActiveAnnotation(null)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[annotation.type]}`}>
                        {typeLabels[annotation.type]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(annotation.confidence * 100)}% zekerheid
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">"{annotation.text}"</p>
                    <p className="text-sm text-gray-600">{annotation.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Geen specifieke bevindingen voor dit artikel.</p>
        </div>
      )}
    </div>
  );
}