// 유저 검색 응답
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
// 유저 검색 상세 조회
export interface SearchUsersDetailResponse {
  nickname?: string;
  description?: string;
  profileImg?: string;
  backgroundImg?: string;
  followerNum?: number;
  followingNum?: number;
  postCount?: number;
  isVisible?: boolean;
}
// 장소 검색 응답
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
