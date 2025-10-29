package a201.reservation.repository;

import a201.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findAllByUserId(Long userId);
    List<Reservation> findAllByPlaceId(Long placeId);

}
