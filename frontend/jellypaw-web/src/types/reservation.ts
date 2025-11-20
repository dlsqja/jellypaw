// 예약 생성 데이터 요청
export interface CreateReservationRequest {
  date: string;
  time: number;
  content: string;
  placeName: string;
}

// 예약 생성 데이터 응답
export interface CreateReservationResponse {
  userId?: number;
  placeId?: number;
  date?: string;
  time?: number;
  content?: string;
  placeName?: string;
}

// 예약 데이터 조회 응답
export interface GetReservationResponse {
  reservations: CreateReservationResponse[];
}
