// src/types/auth.ts
export interface KakaoLoginResponse {
  needSignup: boolean;
  authId?: number;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    userId: number;
    nickname: string;
    description?: string;
    profileImg?: string;
    backgroundImg?: string;
    role: string;
  };
}
