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
