export interface RedisPlace {
  placeCode: string;
  title: string;
  address: string;
  phoneNumber?: string;
  openingHours?: string[];
  link?: string;
}

export interface RedisBoardResponse {
  id: number;
  title: string;
  content: string;
  images: string[];
  starRating: number;
  category: string;
  place?: RedisPlace | null;
}
