import apiClient from '@/lib/axios';
import type { GetFeedsResponse, GetFeedDetailResponse } from '@/types/feed';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 게시글 전체 목록 조회
export const getFeeds = async (): Promise<GetFeedsResponse[]> => {
  const response = await apiClient.get<ApiResponse<GetFeedsResponse[]>>('/boards');
  return response.data.data;
};

// 게시글 상세 조회
export const getFeedDetail = async (boardId: number): Promise<GetFeedDetailResponse> => {
  const response = await apiClient.get<ApiResponse<GetFeedDetailResponse>>(`/boards/${boardId}`);
  return response.data.data;
};

// 게시글 수정
// export const updateFeed = async (post_id: number, data: any): Promise<any> => {
//   const response = await apiClient.patch<any>(`/boards/${post_id}`, data);
//   return response.data;
// };

// 게시글 삭제
// export const deleteFeed = async (post_id: number): Promise<any> => {
//   const response = await apiClient.delete<any>(`/boards/${post_id}`);
//   return response.data;
// };

// 댓글 조회
// export const getComments = async (post_id: number): Promise<any[]> => {
//   const response = await apiClient.get<any[]>(`/comments/${post_id}`);
//   return response.data;
// };

// 댓글 생성
// export const createComment = async (post_id: number, data: any): Promise<any> => {
//   const response = await apiClient.post<any>(`/comments/${post_id}`, data);
//   return response.data;
// };

// 댓글 수정
// export const updateComment = async (comment_id: number, data: any): Promise<any> => {
//   const response = await apiClient.patch<any>(`/comments/${comment_id}`, data);
//   return response.data;
// };

// 댓글 삭제
// export const deleteComment = async (comment_id: number): Promise<any> => {
//   const response = await apiClient.delete<any>(`/comments/${comment_id}`);
//   return response.data;
// };
