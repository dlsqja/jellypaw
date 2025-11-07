// 프로필 조회 응답
export interface GetProfileResponse {
  userId?: number;
  nickname?: string;
  description?: string;
  profileImg?: string;
  backgroundImg?: string;
  role?: string;
  accessToken?: string;
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
