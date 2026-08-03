export interface GuideSection {
  heading: string;
  body: string;
  image_url?: string;
}

export interface FeaturedSpot {
  name: string;
  type: 'dog_park' | 'trail' | 'bar_restaurant';
  address?: string;
  tip?: string;
}

export interface CityGuide {
  id: string;
  city: string;
  slug: string;
  state: string;
  tagline: string;
  intro: string;
  hero_image_url: string;
  accent_color: string;
  quick_facts: Record<string, string>;
  sections: GuideSection[];
  featured_spots: FeaturedSpot[];
  tags: string[];
  last_updated: string;
  created_at: string;
}
