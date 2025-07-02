// Wallpaper Ads Configuration and Pricing

export interface WallpaperAdSlot {
  id: string;
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'available' | 'booked' | 'past';
  advertiser?: string;
  price: number;
}

export interface PricingTier {
  name: string;
  description: string;
  basePrice: number;
  features: string[];
}

// Pricing Configuration
export const PRICING_CONFIG = {
  // Base prices per day
  basePricePerDay: 299,
  
  // Time-based multipliers
  timeMultipliers: {
    morning: 1.2,    // 6:00-12:00 (high traffic)
    afternoon: 1.0,  // 12:00-18:00 (standard)
    evening: 1.3,    // 18:00-00:00 (peak traffic)
    night: 0.7       // 00:00-6:00 (low traffic)
  },
  
  // Day of week multipliers
  dayMultipliers: {
    monday: 1.0,
    tuesday: 1.0,
    wednesday: 1.0,
    thursday: 1.0,
    friday: 0.9,
    saturday: 0.8,
    sunday: 0.8
  },
  
  // Bulk discounts
  bulkDiscounts: {
    week: 0.15,      // 15% discount for full week
    month: 0.25,     // 25% discount for full month
    quarter: 0.35    // 35% discount for full quarter
  }
};

// Pricing tiers for different packages
export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Day Pass',
    description: 'Perfect voor product launches of events',
    basePrice: 299,
    features: [
      '24 uur exposure',
      'Alle tijdslots',
      'Basic analytics',
      'Click tracking'
    ]
  },
  {
    name: 'Week Package',
    description: 'Ideaal voor campagnes',
    basePrice: 1499, // With 15% discount applied
    features: [
      '7 dagen exposure',
      'Prime time slots',
      'Detailed analytics',
      'A/B testing (2 varianten)',
      'Dedicated support'
    ]
  },
  {
    name: 'Month Package',
    description: 'Maximale impact',
    basePrice: 4999, // With 25% discount applied
    features: [
      '30 dagen exposure',
      'Premium time slot selectie',
      'Real-time dashboard',
      'Unlimited A/B testing',
      'Priority support',
      'Custom targeting'
    ]
  }
];

// Self-promotion ad configuration
export const SELF_PROMO_AD = {
  id: 'nukk-self-promo',
  imageUrl: '/images/advertise-here.jpg', // We'll create this
  advertiserName: 'nukk.nl',
  advertiserLogo: '/images/nukk-logo.png',
  clickUrl: '/adverteren',
  backgroundColor: '#0066cc',
  textColor: '#ffffff',
  duration: 7, // Slightly longer to explain the opportunity
  content: {
    headline: 'Adverteer hier',
    subheadline: 'Bereik 50.000+ kritische denkers',
    features: [
      'Premium full-screen advertenties',
      'Vanaf €299 per dag',
      'Hoogopgeleid publiek',
      'Transparante metrics'
    ],
    cta: 'Ontdek de mogelijkheden'
  }
};

// Ad rotation logic
export class AdRotationManager {
  private static instance: AdRotationManager;
  private currentRotation: number = 0;
  private lastRotation: Date = new Date();
  
  static getInstance(): AdRotationManager {
    if (!AdRotationManager.instance) {
      AdRotationManager.instance = new AdRotationManager();
    }
    return AdRotationManager.instance;
  }
  
  // Rotation frequency: every 100 page views or every hour
  shouldRotate(): boolean {
    const now = new Date();
    const hoursSinceLastRotation = (now.getTime() - this.lastRotation.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastRotation >= 1;
  }
  
  rotate(): void {
    this.currentRotation++;
    this.lastRotation = new Date();
  }
  
  // Show self-promo ad every 5th rotation
  shouldShowSelfPromo(): boolean {
    return this.currentRotation % 5 === 0;
  }
}

// Calculate price for a specific slot
export function calculateSlotPrice(
  date: Date,
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night'
): number {
  const dayOfWeek = date.toLocaleLowerCase('en-US', { weekday: 'long' }) as keyof typeof PRICING_CONFIG.dayMultipliers;
  
  const basePrice = PRICING_CONFIG.basePricePerDay;
  const timeMultiplier = PRICING_CONFIG.timeMultipliers[timeSlot];
  const dayMultiplier = PRICING_CONFIG.dayMultipliers[dayOfWeek];
  
  return Math.round(basePrice * timeMultiplier * dayMultiplier);
}

// Get available slots for booking
export function getAvailableSlots(startDate: Date, days: number): WallpaperAdSlot[] {
  const slots: WallpaperAdSlot[] = [];
  const timeSlots: Array<'morning' | 'afternoon' | 'evening' | 'night'> = ['morning', 'afternoon', 'evening', 'night'];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    for (const timeSlot of timeSlots) {
      slots.push({
        id: `${date.toISOString().split('T')[0]}-${timeSlot}`,
        date: date.toISOString().split('T')[0],
        timeSlot,
        status: 'available',
        price: calculateSlotPrice(date, timeSlot)
      });
    }
  }
  
  return slots;
}