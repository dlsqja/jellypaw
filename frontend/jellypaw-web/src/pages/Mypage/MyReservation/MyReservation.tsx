import ReservationBox from '../components/ReservationBox';

const reservationsData = [
  {
    reservationId: 1,
    storeName: '펫살롱 아름다운',
    date: '2024년 1월 15일 오후 2:00',
    price: '45,000원',
  },
  {
    reservationId: 2,
    storeName: '동물병원 건강',
    date: '2024년 1월 20일 오전 10:00',
    price: '80,000원',
  },
  {
    reservationId: 3,
    storeName: '반려동물 카페',
    date: '2024년 1월 25일 오후 3:00',
    price: '25,000원',
  },
];

export default function MyReservation() {
  return (
    <div className="flex flex-col gap-4 mb-4">
      {reservationsData.map((reservation) => (
        <ReservationBox
          key={reservation.reservationId}
          storeName={reservation.storeName}
          date={reservation.date}
          price={reservation.price}
        ></ReservationBox>
      ))}
    </div>
  );
}
