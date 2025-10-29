package a201.reservation.service;

import a201.reservation.dto.ReservationRequest;
import a201.reservation.entity.Reservation;
import a201.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReservationService {

    private ReservationRepository reservationRepository;

    public Reservation reserve(Long placeId, ReservationRequest reservationRequest) {

        String content = reservationRequest.getContent();
        LocalDate reservationDate = reservationRequest.getDate();
        Integer reservationTime = reservationRequest.getTime();
        Long userId = reservationRequest.getUserId();

        return reservationRepository.save(
                Reservation.builder()
                        .placeId(placeId)
                        .userId(userId)
                        .content(content)
                        .date(reservationDate)
                        .time(reservationTime)
                        .build()
        );
    }

    public List<Reservation> getUserReservationList(Long userId) {

        return reservationRepository.findAllByUserId(userId);
    }

    public List<Reservation> getPlaceReservationList(Long placeId) {

        return reservationRepository.findAllByPlaceId(placeId);
    }
}
