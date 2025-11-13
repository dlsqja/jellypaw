// 게시글 상세 조회 응답
export interface FeedDetailResponse {
  id: number;
  boardUser: {
    id: number;
    nickname: string;
    profileImg: string;
  };
  title: string;
  content: string;
  placeId: string;
  starRating: number;
  createdAt: string;
  images: string[];
}
// 게시글 작성 요청
export interface FeedWriteRequest {
  category: string;
  title: string;
  content: string;
  placeId: number | null;
  starRating: number;
  visibility: string;
}

export interface FeedWritePlaceRequest {
  placeCode?: string;
  title?: string;
  address?: string;
  phoneNumber?: string;
  openingHours?: string[];
  link?: string;
}
