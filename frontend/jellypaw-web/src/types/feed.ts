// 게시글 전체 목록 조회 응답
export interface GetFeedsResponse {
  boardUser?: {
    id?: number;
    nickname?: string;
    profileImg?: string | null;
  };
  content?: string;
  createdAt?: string;
  id?: number;
  images?: string[] | null;
  starRating?: number;
  title?: string;
  // 아래 내용 추가 되어야 함
  //   likeCount?: number;
  //   commentCount?: number;
}

// 게시글 상세 조회 응답
export interface GetFeedDetailResponse extends GetFeedsResponse {
  likeCount?: number;
  commentCount?: number;
  isFollowing?: boolean;
}

// 댓글 조회 응답
export interface GetCommentsResponse {
  id?: number;
  parent?: number;
  userId: {
    id: number;
    nickname: string;
    profileImg: string;
  };
  content?: string;
  createdAt?: string;
  replyCount?: number;
  replies?: [];
}

// 댓글 작성 요청
// parent가 null 이면 댓글, 아니면 대댓글
export interface CreateCommentRequest {
  parent?: number | null;
  content?: string;
}

// 게시글 삭제 응답
export interface DeleteFeedResponse {
  code: number;
  message: string;
  data: any;
}
