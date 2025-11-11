// 팔로워 유저 목록 조회 응답
export interface GetFollowersResponse {
  userId?: number;
  nickname?: string;
  profileImg?: string;
}

// 팔로잉
export interface GetFollowingResponse {
  code?: number;
  message?: string;
  data?: string;
}
