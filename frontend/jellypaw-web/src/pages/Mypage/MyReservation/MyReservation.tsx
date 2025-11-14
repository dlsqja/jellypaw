import ReservationBox from '../components/ReservationBox';
import { getReservation } from '@/services/api/reservation';
import { useEffect, useState, useMemo } from 'react';
import type { GetReservationResponse } from '@/types/reservation';

// 예약까지 남은 일수 계산
const calculateDaysRemaining = (dateString: string): number | null => {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservationDate = new Date(dateString);
  reservationDate.setHours(0, 0, 0, 0);

  // 예약 날짜가 오늘보다 이전이면 null 반환
  if (reservationDate < today) return null;

  // 남은 일수 계산 (밀리초를 일로 변환)
  const diffTime = reservationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// 예약이 지나갔는지 확인하는 함수
const isReservationPast = (dateString: string, slotIndex: number): boolean => {
  if (!dateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservationDate = new Date(dateString);
  reservationDate.setHours(0, 0, 0, 0);

  // 예약 날짜가 오늘보다 이전이면 지나간 예약
  if (reservationDate < today) return true;

  // 예약 날짜가 오늘이면 시간을 비교
  if (reservationDate.getTime() === today.getTime()) {
    const reservationHour = Math.floor(slotIndex / 2);
    const reservationMinute = (slotIndex % 2) * 30;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 예약 시간이 현재 시간 이전이면 지나간 예약
    if (reservationHour < currentHour) return true;
    if (reservationHour === currentHour && reservationMinute <= currentMinute) return true;
  }

  return false;
};

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

  // 예약을 지나간 예약과 다가올 예약으로 분류하고 정렬
  const { pastReservations, upcomingReservations } = useMemo(() => {
    const past: GetReservationResponse['reservations'] = [];
    const upcoming: GetReservationResponse['reservations'] = [];

    reservations.forEach((reservation) => {
      if (isReservationPast(reservation.date || '', reservation.time || 0)) {
        past.push(reservation);
      } else {
        upcoming.push(reservation);
      }
    });

    // 정렬 함수: 날짜와 시간을 기준으로 정렬
    const sortByDateAndTime = (a: GetReservationResponse['reservations'][0], b: GetReservationResponse['reservations'][0]) => {
      const dateA = new Date(a.date || '').getTime();
      const dateB = new Date(b.date || '').getTime();

      // 날짜가 같으면 시간으로 비교
      if (dateA === dateB) {
        return (a.time || 0) - (b.time || 0);
      }

      return dateA - dateB;
    };

    // 다가올 예약: 날짜 오름차순 (가까운 날짜부터)
    upcoming.sort(sortByDateAndTime);

    // 지나간 예약: 날짜 내림차순 (최근 날짜부터)
    past.sort((a, b) => {
      const dateA = new Date(a.date || '').getTime();
      const dateB = new Date(b.date || '').getTime();

      if (dateA === dateB) {
        return (b.time || 0) - (a.time || 0);
      }

      return dateB - dateA;
    });

    return { pastReservations: past, upcomingReservations: upcoming };
  }, [reservations]);

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* 다가올 예약 */}
      {upcomingReservations.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <h2 className="text-aqua-500 h6-b pl-2">다가오는 예약</h2>
            <h2 className="text-pink-300 h6-b">{upcomingReservations.length}</h2>
          </div>
          {upcomingReservations.map((reservation, index) => {
            const daysRemaining = calculateDaysRemaining(reservation.date || '');
            return (
              <ReservationBox
                key={`upcoming-${index}`}
                reservationId={reservation.userId || 0}
                placeName={reservation.placeName || ''}
                time={reservation.time || 0}
                date={reservation.date || ''}
                content={reservation.content || ''}
                placeId={reservation.placeId || 0}
                daysRemaining={daysRemaining}
              />
            );
          })}
        </div>
      )}

      {/* 지나간 예약 */}
      {pastReservations.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-gray-400 h6-b pl-2">지난 예약</h2>
          <div className="flex flex-col gap-2">
            {pastReservations.map((reservation, index) => {
              return (
                <ReservationBox
                  key={`past-${index}`}
                  reservationId={reservation.userId || 0}
                  placeName={reservation.placeName || ''}
                  time={reservation.time || 0}
                  date={reservation.date || ''}
                  content={reservation.content || ''}
                  placeId={reservation.placeId || 0}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
