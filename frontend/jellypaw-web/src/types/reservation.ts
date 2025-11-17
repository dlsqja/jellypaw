// 예약 데이터 요청
export interface ReservationRequest {
  date: string;
  time: number;
  content: string;
}

// 예약 데이터 응답
export interface ReservationResponse {
  userId: number;
  placeId: number;
  date: string;
  time: number;
  content: string;
}

// 예약 데이터 조회 응답
export interface GetReservationResponse {
  reservations: ReservationResponse[];
}
