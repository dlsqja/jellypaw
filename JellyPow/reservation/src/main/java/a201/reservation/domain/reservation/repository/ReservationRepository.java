package a201.reservation.domain.reservation.repository;

import a201.reservation.domain.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findAllByUserId(Long userId);
    List<Reservation> findAllByPlaceId(Long placeId);

    boolean existsByPlaceIdAndDateAndTime(Long placeId, LocalDate date, Integer time);
}
