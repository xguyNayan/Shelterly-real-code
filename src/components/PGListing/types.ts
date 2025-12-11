export interface PGData {
  id: string;
  name: string;
  address: string;
  location: string;
  gender: 'male' | 'female' | 'unisex';
  status?: 'initial' | 'verification' | 'listing' | 'active';
  averageRating?: number;
  reviewCount?: number;
  beds: number;
  food: boolean;
  foodType?: 'veg' | 'non-veg' | 'both' | '';
  deposit: number;
  oneSharing: { available: boolean; price?: number };
  twoSharing: { available: boolean; price?: number };
  threeSharing: { available: boolean; price?: number };
  fourSharing: { available: boolean; price?: number };
  fiveSharing: { available: boolean; price?: number };
  // Room price properties used in PricingCards component
  singleRoomPrice?: number;
  doubleRoomPrice?: number;
  tripleRoomPrice?: number;
  // Amenities property used in PGBulkUpload component
  amenities?: {
    [key: string]: boolean | string;
  };
  washroom: 'attached' | 'common' | 'both';
  fridge: boolean;
  wifi: boolean | string;
  washingMachine: boolean;
  housekeeping: boolean;
  parking: boolean;
  security: boolean | string;
  tv: boolean;
  lift?: boolean | string;
  powerBackup?: boolean | string;
  photos: { url: string; category: string; caption?: string }[];
  videos?: { videoUrl: string; thumbnailUrl: string; category: string; caption?: string; duration?: number }[];
  nearestCollege: string;
  coordinates?: { lat: number; lng: number };
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isVerified?: boolean;
  discount?: number;
  description?: string;
  
  // Additional fields for PG details page
  preferredTenants?: string;
  noticePeriod?: string | number;
  securityDeposit?: string;
  furnished?: string | boolean;
  neighborhoodDescription?: string;
  neighborhoodHighlight?: string;
  commute?: string;
  nearbyPlaces?: Array<{ type: string; name: string; distance: string; time: string }>;
  transportation?: string[] | string;
  essentialServices?: string[] | string;
  
  // Additional charges fields
  lockIn?: number;
  electricityCharges?: string;
  additionalCharges?: Array<{
    name: string;
    amount?: number | string;
    displayText?: string;
    description?: string;
    required?: boolean;
  }>;
}
