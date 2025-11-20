export interface SearchResult {
  place_id: string;
  name: string;
  address: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address?: string;
  phone_number?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text: string[];
  };
}
