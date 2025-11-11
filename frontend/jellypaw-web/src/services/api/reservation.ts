import apiClient from '@/lib/axios';
import type { ReservationRequest, ReservationResponse } from '@/types/reservation';

export const createReservation = async (place_id: number, reservationRequest: ReservationRequest): Promise<ReservationResponse> => {
  const response = await apiClient.post(`/reservations/${place_id}`, reservationRequest);
  return response.data.data;
};
