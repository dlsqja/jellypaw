// types/main/redis.ts

export interface RedisPlace {
  id?: number;             
  title: string;             
  address: string;           
  openingHours?: string;    
  phoneNumber?: string;     
  link?: string;            
  userId?: number;   
  starRating?: number;        
  postCount?: number;         
  user?: any;        
}

export interface RedisBoardResponse {
  id: number;
  title: string;
  content: string;

  boardUser?: {
    id?: number;
    nickname?: string;
    profileImg?: string | null;
  };

  placeId?: number | null;
  starRating: number;
  createdAt?: string;
  images: string[];
  commentCount?: number;
  likeCount?: number;
  viewCount?: number;
  category: string;
  visibility?: string;

  place?: RedisPlace | null;
}
