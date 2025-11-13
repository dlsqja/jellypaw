import type { SearchPlacesDetailResponse } from "./search";

// 게시글 전체 목록 조회 응답
export interface GetFeedsResponse {
  boardUser?: {
    id?: number;
    nickname?: string;
    profileImg?: string | null;
  };
  category?: string;
  commentCount?: number;
  content?: string;
  createdAt?: string;
  id?: number;
  images?: string[] | null;
  likeCount?: number;
  placeId?: number | null;
  starRating?: number;
  title?: string;
  viewCount?: number;
  visibility?: string;
}
[];

// 게시글 상세 조회 응답
export interface GetFeedDetailResponse extends GetFeedsResponse {
  likeCount?: number;
  commentCount?: number;
  isFollowing?: boolean;
}

// 댓글 조회 응답
export interface GetCommentsResponse {
  childs?: GetCommentsResponse[];
  content?: string;
  createdAt?: string;
  id?: number;
  userId: {
    id: number;
    nickname: string;
    profileImg: string;
  };
}

// 게시글 삭제 응답
export interface DeleteFeedResponse {
  code: number;
  message: string;
  data: any;
}

// 댓글 삭제 응답
export interface DeleteCommentResponse {
  code: number;
  message: string;
  data: any;
}

// 좋아요 추가 응답
export interface AddLikeResponse {
  code: number;
  message: string;
  data: any;
}

// 좋아요 취소 응답
export interface CancelLikeResponse {
  code: number;
  message: string;
  data: any;
}

export interface BoardWithPlaceResponse extends GetFeedDetailResponse {
  place?: SearchPlacesDetailResponse | null;
}
