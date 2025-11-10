// src/types/auth.ts
export interface KakaoLoginResponse {
  needSignup: boolean;
  authId?: number;
  email?: string;
  accessToken?: string; // needSignup=false일 때
  user?: {
    userId: number;
    nickname: string;
    description?: string;
    profileImg?: string;
    backgroundImg?: string;
    role: string;
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
