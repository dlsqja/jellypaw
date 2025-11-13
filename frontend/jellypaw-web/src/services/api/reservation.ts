import apiClient from '@/lib/axios';
import type { ReservationRequest, ReservationResponse, GetReservationResponse } from '@/types/reservation';

// 예약 생성
export const createReservation = async (place_id: number, reservationRequest: ReservationRequest): Promise<ReservationResponse> => {
  const response = await apiClient.post(`/reservations/${place_id}`, reservationRequest);
  return response.data.data;
};

// 예약 조회
export const getReservation = async (): Promise<GetReservationResponse> => {
  const response = await apiClient.get('/reservations/users');
  return response.data.data;
};
