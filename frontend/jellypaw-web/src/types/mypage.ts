// 프로필 조회 응답
export interface GetProfileResponse {
  userId?: number;
  nickname?: string;
  description?: string;
  profileImg?: string;
  backgroundImg?: string;
  followerNum?: number;
  followingNum?: number;
  postCount?: number;
  role?: string;
}

// 프로필 수정 요청
export interface EditProfileRequest {
  email?: string;
  nickname?: string;
  description?: string;
  deleteProfileImg?: boolean; // 삭제 버튼을 눌렀을 때만 true로 전달
  // deleteBackgroundImg: boolean;
}

export interface EditProfileImageRequest {
  profileImg?: File | null;
}

export interface GetMyFeedResponse {
  boards: {
    id: number;
    boardUser: {
      id: number;
      nickname: string;
      profileImg: string | null;
    };
    title: string;
    content: string;
    placeId: number | null;
    starRating: number;
    createdAt: string;
    images: string[] | null;
    commentCount: number;
    likeCount: number;
    viewCount: number;
    category: string;
    visibility: string;
  }[];
}
