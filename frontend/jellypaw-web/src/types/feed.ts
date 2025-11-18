import type { SearchPlacesDetailResponse } from './search';

// 게시글 전체 목록 조회 응답
export interface GetFeedsResponse {
  id?: number;
  boardUser?: {
    id?: number;
    nickname?: string;
    profileImg?: string | null;
  };
  title?: string;
  content?: string;
  placeId?: number | null;
  starRating?: number;
  createdAt?: string;
  images?: string[] | null;
  commentCount?: number;
  likeCount?: number;
  viewCount?: number;
  category?: string;
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

// 댓글 생성 응답
export interface CreateCommentResponse {
  code: number;
  message: string;
  data: GetCommentsResponse[];
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

// 특정 사용자의 게시글 조회 응답
export interface GetUserFeedsResponse {
  boards?: GetFeedsResponse[];
}

// 게시글 수정용 장소 데이터
export interface BoardWithPlaceResponse extends GetFeedDetailResponse {
  place?: SearchPlacesDetailResponse | null;
}

// 좋아요한 게시글 조회 응답
export interface GetLikedFeedsResponse {
  boardId: number;
}
