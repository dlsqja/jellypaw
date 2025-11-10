export interface SearchUsersResponse {
  userId?: number;
  nickname?: string;
  description?: string;
  profileImg?: string;
  backgroundImg?: string;
  follower?: number;
  following?: number;
  role?: string;
  accessToken?: string;
}

export interface SearchPlacesResponse {
  nextCursor?: number | null;
  places?: {
    id?: number;
    title?: string;
    address?: string;
    openingHours?: string;
    phoneNumber?: string;
    link?: string;
    userId?: number;
    starRating?: number;
    postCount?: number;
  }[];
}
