export interface Database {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Partial<EventRow>;
        Update: Partial<EventRow>;
      };
      cities: {
        Row: CityRow;
        Insert: Partial<CityRow>;
        Update: Partial<CityRow>;
      };
      event_categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow>;
        Update: Partial<CategoryRow>;
      };
    };
  };
}

export interface EventRow {
  id: string;
  title: string;
  description: string;
  location_name: string;
  address: string;
  city_id: string | null;
  category_id: string | null;
  event_date: string;
  end_date: string | null;
  image_url: string;
  organizer_name: string;
  organizer_url: string | null;
  external_url: string | null;
  phone_number: string | null;
  website: string | null;
  is_sponsored: boolean;
  is_free: boolean;
  price_text: string | null;
  dogs_welcome: boolean;
  max_dogs: number | null;
  tags: string[];
  created_at: string;
}

export interface CityRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface EventWithRelations extends EventRow {
  cities: CityRow | null;
  event_categories: CategoryRow | null;
}

export interface PetDeal {
  id: string;
  title: string;
  description: string;
  store: string;
  store_logo_color: string;
  category: string;
  image_url: string;
  link: string;
  price: number | null;
  original_price: number | null;
  price_text: string;
  original_price_text: string;
  discount_pct: number | null;
  discount_label: string;
  badges: string[];
  votes: number;
  comment_count: number;
  is_featured: boolean;
  is_expired: boolean;
  posted_at: string;
  expires_at: string | null;
  last_verified_at: string | null;
  created_at: string;
}
