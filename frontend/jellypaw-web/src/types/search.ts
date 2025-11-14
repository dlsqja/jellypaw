import type { GetProfileResponse } from './mypage';
import type { GetFeedsResponse } from './feed';
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
  backgroundImg?: string;
  description?: string;
  followerNum?: number;
  followingNum?: number;
  isFollowing?: boolean;
  isVisible?: boolean;
  nickname?: string;
  postCount?: number;
  profileImg?: string;
  userId?: number;
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

// 장소 검색 상세 조회 응답
export interface SearchPlacesDetailResponse {
  address?: string;
  id?: number;
  link?: string;
  openingHours?: string;
  phoneNumber?: string;
  postCount?: number;
  starRating?: number;
  title?: string;
  user?: GetProfileResponse | null;
  userid: number;
}

export interface GetPlaceFeedsResponse {
  boards?: GetFeedsResponse[];
}
