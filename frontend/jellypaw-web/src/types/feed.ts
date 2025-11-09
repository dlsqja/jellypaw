// 게시글 전체 목록 조회 응답
export interface GetFeedsResponse {
  boardUser: {
    id?: number;
    nickname?: string;
    profileImg?: string;
  };
  content?: string;
  createdAt?: string;
  id?: number;
  images?: string[];
  starRating?: number;
  title?: string;

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
}