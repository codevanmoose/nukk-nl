'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Euro, ShoppingCart, Info } from 'lucide-react';
import Link from 'next/link';
import { 
  PRICING_CONFIG, 
  PRICING_TIERS, 
  getAvailableSlots, 
  calculateSlotPrice,
  WallpaperAdSlot 
} from '@/lib/wallpaper-ads-config';

export default function AdBookingPage() {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  
  // Generate slots for the next 90 days
  const allSlots = useMemo(() => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    return getAvailableSlots(startDate, 90);
  }, []);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, WallpaperAdSlot[]>();
    allSlots.forEach(slot => {
      if (!grouped.has(slot.date)) {
        grouped.set(slot.date, []);
      }
      grouped.get(slot.date)!.push(slot);
    });
    return grouped;
  }, [allSlots]);

  const toggleSlot = (slotId: string) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedSlots(newSelected);
  };

  const selectDay = (date: string) => {
    const daySlots = slotsByDate.get(date) || [];
    const newSelected = new Set(selectedSlots);
    
    const allSelected = daySlots.every(slot => newSelected.has(slot.id));
    
    if (allSelected) {
      // Deselect all
      daySlots.forEach(slot => newSelected.delete(slot.id));
    } else {
      // Select all
      daySlots.forEach(slot => newSelected.add(slot.id));
    }
    
    setSelectedSlots(newSelected);
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;
    selectedSlots.forEach(slotId => {
      const slot = allSlots.find(s => s.id === slotId);
      if (slot) {
        total += slot.price;
      }
    });
    
    // Apply bulk discounts
    const selectedCount = selectedSlots.size;
    if (selectedCount >= 28 * 4) { // Month (28 days * 4 slots)
      total = total * (1 - PRICING_CONFIG.bulkDiscounts.month);
    } else if (selectedCount >= 7 * 4) { // Week
      total = total * (1 - PRICING_CONFIG.bulkDiscounts.week);
    }
    
    return Math.round(total);
  }, [selectedSlots, allSlots]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getTimeSlotDisplay = (slot: string) => {
    const displays = {
      morning: { label: 'Ochtend', time: '06:00-12:00', icon: '🌅' },
      afternoon: { label: 'Middag', time: '12:00-18:00', icon: '☀️' },
      evening: { label: 'Avond', time: '18:00-00:00', icon: '🌆' },
      night: { label: 'Nacht', time: '00:00-06:00', icon: '🌙' }
    };
    return displays[slot as keyof typeof displays];
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/adverteren">
            <Button variant="outline" size="sm" className="mb-4">
              ← Terug naar overzicht
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Boek uw advertentie slots</h1>
          <p className="text-lg text-muted-foreground">
            Selecteer de dagen en tijdslots voor uw wallpaper advertentie
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Beschikbare slots</CardTitle>
                <CardDescription>
                  Klik op een dag om alle tijdslots te selecteren, of selecteer individuele slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* View mode selector */}
                <div className="flex gap-2 mb-6">
                  <Button 
                    variant={viewMode === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                  >
                    Per dag
                  </Button>
                  <Button 
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Per week
                  </Button>
                  <Button 
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Per maand
                  </Button>
                </div>

                {/* Slots grid */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {Array.from(slotsByDate.entries()).slice(0, 30).map(([date, slots]) => {
                    const daySelected = slots.every(slot => selectedSlots.has(slot.id));
                    
                    return (
                      <div key={date} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 
                            className="font-semibold cursor-pointer hover:text-blue-600"
                            onClick={() => selectDay(date)}
                          >
                            {formatDate(date)}
                          </h3>
                          <Button
                            variant={daySelected ? 'default' : 'outline'}
                            size="xs"
                            onClick={() => selectDay(date)}
                          >
                            {daySelected ? 'Deselecteer dag' : 'Selecteer hele dag'}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {slots.map(slot => {
                            const timeSlot = getTimeSlotDisplay(slot.timeSlot);
                            const isSelected = selectedSlots.has(slot.id);
                            
                            return (
                              <button
                                key={slot.id}
                                onClick={() => toggleSlot(slot.id)}
                                className={`
                                  p-3 rounded-lg border text-left transition-all
                                  ${isSelected 
                                    ? 'border-blue-600 bg-blue-50 text-blue-900' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                  ${slot.status === 'booked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                                disabled={slot.status === 'booked'}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-lg">{timeSlot.icon}</span>
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-sm">{timeSlot.label}</p>
                                <p className="text-xs text-muted-foreground">{timeSlot.time}</p>
                                <p className="text-xs font-semibold mt-1">€{slot.price}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary section */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Overzicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Geselecteerde slots</p>
                    <p className="text-2xl font-bold">{selectedSlots.size}</p>
                  </div>

                  {selectedSlots.size > 0 && (
                    <>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground">Subtotaal</span>
                          <span>€{Math.round(totalPrice / (selectedSlots.size >= 28 ? 0.75 : selectedSlots.size >= 7 ? 0.85 : 1))}</span>
                        </div>
                        
                        {selectedSlots.size >= 7 && (
                          <div className="flex justify-between items-center mb-2 text-green-600">
                            <span>Bulk korting</span>
                            <span>-{selectedSlots.size >= 28 ? '25' : '15'}%</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                          <span>Totaal</span>
                          <span>€{totalPrice}</span>
                        </div>
                      </div>

                      <Button className="w-full" size="lg">
                        Doorgaan met boeken
                      </Button>
                    </>
                  )}

                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    <Info className="w-4 h-4 text-blue-600 mb-1" />
                    <p className="text-blue-900">
                      Boek meer slots voor kortingen:
                    </p>
                    <ul className="text-blue-800 text-xs mt-1 space-y-1">
                      <li>• Week (28+ slots): 15% korting</li>
                      <li>• Maand (112+ slots): 25% korting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}