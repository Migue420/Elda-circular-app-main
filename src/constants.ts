export interface PickupPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activeFrom: string;
  activeTo: string;
}

export interface WasteItem {
  id: string;
  title: string;
  description: string;
  category: 'mueble'|'electrodomestico'|'textil'|'otros';
  createdAt: number;
  ownerId: string;
  claimedBy?: string;
  photo?: string;
}

export interface UserProfile {
  name: string;
  coins: number;
  badges: string[];
  impactKg: number;
  onboarded: boolean;
}

export const PICKUP_POINTS: PickupPoint[] = [
  { id: '1', name: 'Calle Nueva / Colón', lat: 38.4772, lng: -0.7938, activeFrom: '20:00', activeTo: '00:00' },
  { id: '2', name: 'Plaza Mayor / Ortega y Gasset', lat: 38.4785, lng: -0.7942, activeFrom: '20:00', activeTo: '00:00' },
  { id: '3', name: 'Plaza Sagasta', lat: 38.4760, lng: -0.7925, activeFrom: '20:00', activeTo: '00:00' },
  { id: '4', name: 'Jardín de la Música', lat: 38.4795, lng: -0.7915, activeFrom: '20:00', activeTo: '00:00' },
  { id: '5', name: 'Avenida de Madrid', lat: 38.4820, lng: -0.7960, activeFrom: '20:00', activeTo: '00:00' },
  { id: '6', name: 'Plaza Castelar', lat: 38.4755, lng: -0.7965, activeFrom: '20:00', activeTo: '00:00' },
  { id: '7', name: 'Padre Manjón', lat: 38.4780, lng: -0.7900, activeFrom: '20:00', activeTo: '00:00' },
  { id: '8', name: 'Plaza de Toros', lat: 38.4815, lng: -0.7890, activeFrom: '20:00', activeTo: '00:00' },
  { id: '9', name: 'Calle Juan Carlos I', lat: 38.4740, lng: -0.7940, activeFrom: '20:00', activeTo: '00:00' },
  { id: '10', name: 'Plaza de la Ficia', lat: 38.4770, lng: -0.7980, activeFrom: '20:00', activeTo: '00:00' },
];

export const WASTE_CALENDAR = [
  { day: 0, bag: 'Gris', color: 'bg-gray-500' }, // Sunday
  { day: 1, bag: 'Marrón', color: 'bg-amber-800' }, // Monday
  { day: 2, bag: 'Amarilla', color: 'bg-yellow-400' },
  { day: 3, bag: 'Azul', color: 'bg-blue-600' },
  { day: 4, bag: 'Marrón', color: 'bg-amber-800' },
  { day: 5, bag: 'Amarilla', color: 'bg-yellow-400' },
  { day: 6, bag: 'Azul', color: 'bg-blue-600' },
];
