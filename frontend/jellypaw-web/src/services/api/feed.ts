import apiClient from '@/lib/axios';
import type {
  GetFeedsResponse,
  GetFeedDetailResponse,
  GetCommentsResponse,
  DeleteFeedResponse,
  DeleteCommentResponse,
  AddLikeResponse,
  CancelLikeResponse,
  GetUserFeedsResponse,
  CreateCommentResponse,
} from '@/types/feed';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 게시글 전체 목록 조회
export const getFeeds = async (): Promise<GetFeedsResponse[]> => {
  const response = await apiClient.get<ApiResponse<{ boards: GetFeedsResponse[] }>>('/board-view');
  return response.data.data.boards;
};

// 게시글 상세 조회
export const getFeedDetail = async (boardId: number): Promise<GetFeedDetailResponse> => {
  const response = await apiClient.get<ApiResponse<GetFeedDetailResponse>>(`/boards/${boardId}`);
  return response.data.data;
};

// 댓글 조회
export const getComments = async (boardId: number): Promise<GetCommentsResponse[]> => {
  const response = await apiClient.get<ApiResponse<GetCommentsResponse[]>>(`/comments/${boardId}`);
  return response.data.data;
};

// 댓글 생성 - parentid가 null이면 댓글, 아니면 대댓글
export const createComment = async (boardId: number, parent: number | null, content: string): Promise<GetCommentsResponse[]> => {
  const response = await apiClient.post<ApiResponse<GetCommentsResponse[]>>(`/comments/${boardId}`, { parent, content });
  return response.data.data;
};

// 게시글 삭제
export const deleteFeed = async (boardId: number): Promise<any> => {
  const response = await apiClient.delete<ApiResponse<DeleteFeedResponse>>(`/boards/${boardId}`);
  return response.data.data;
};

// 댓글 삭제
export const deleteComment = async (commentId: number, boardId: number): Promise<any> => {
  const response = await apiClient.delete<DeleteCommentResponse>(`/comments/${boardId}/${commentId}`);
  return response.data;
};

// 좋아요 추가
export const addLike = async (boardId: number): Promise<any> => {
  const response = await apiClient.post<AddLikeResponse>(`/likes/${boardId}`);
  return response.data;
};
// 좋아요 취소
export const cancelLike = async (boardId: number): Promise<any> => {
  const response = await apiClient.delete<CancelLikeResponse>(`/likes/${boardId}`);
  return response.data;
};

// 특정 사용자의 게시글 조회
export const getUserFeeds = async (nickname: string): Promise<GetUserFeedsResponse> => {
  const response = await apiClient.get<ApiResponse<GetUserFeedsResponse>>(`/board-view/${nickname}`);
  return response.data.data;
};
