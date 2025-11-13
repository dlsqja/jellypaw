import ReservationBox from '../components/ReservationBox';
import { getReservation } from '@/services/api/reservation';
import { useEffect, useState } from 'react';
import type { GetReservationResponse } from '@/types/reservation';

export default function MyReservation() {
  const [reservations, setReservations] = useState<GetReservationResponse['reservations']>([]);
  useEffect(() => {
    getReservation()
      .then((response) => {
        console.log('response', response);
        setReservations(response.reservations);
      })
      .catch((error) => {
        console.error('예약 조회 실패:', error);
      });
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-4">
      {reservations.map((reservation, index) => {
        return (
          <ReservationBox
            key={index}
            reservationId={reservation.userId || 0}
            placeName={reservation.placeName || ''}
            time={reservation.time || 0}
            date={reservation.date || ''}
            content={reservation.content || ''}
          ></ReservationBox>
        );
      })}
    </div>
  );
}
