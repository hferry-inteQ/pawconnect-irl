export interface DogPark {
  id: string;
  name: string;
  type: 'dog_park' | 'trail' | 'bar_restaurant';
  city: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
  hours: string | null;
  tags: string[];
  is_free: boolean;
  dog_friendly_notes: string | null;
  image_url: string;
  website: string | null;
  phone: string | null;
  created_at: string;
}
