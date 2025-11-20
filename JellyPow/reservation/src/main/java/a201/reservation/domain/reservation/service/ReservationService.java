package a201.reservation.domain.reservation.service;

import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import a201.reservation.domain.availableTime.entity.AvailableTime;
import a201.reservation.domain.availableTime.repository.AvailableTimeRepository;
import a201.reservation.domain.reservation.dto.ReservationRequest;
import a201.reservation.domain.reservation.entity.Reservation;
import a201.reservation.domain.reservation.repository.ReservationRepository;
import a201.reservation.global.enums.ReservationStatus;
import a201.reservation.global.enums.TimeStatus;
import a201.reservation.global.event.ReservationCommitEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT;

@Service
@Transactional
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final ApplicationEventPublisher eventPublisher;


    public Reservation reserve(Long placeId, Long userId, ReservationRequest reservationRequest) {

        String content = reservationRequest.getContent();
        LocalDate reservationDate = reservationRequest.getDate();
        Integer reservationTime = reservationRequest.getTime();

        AvailableTime availableTime = availableTimeRepository
                .findAvailableTimeByPlaceIdAndDate(placeId, reservationDate)
                .orElseThrow(() -> new CustomException(ErrorCode.TIME_TABLE_NOT_FOUND));

        String time = reservationTime.toString();
        TimeStatus timeStatus = availableTime.getTimeTable().get(time);

        if(timeStatus == null) {
            throw new CustomException(ErrorCode.TIME_NOT_FOUND);
        }
        if(timeStatus != TimeStatus.AVAILABLE){
            throw new CustomException(ErrorCode.ALREADY_RESERVED_TIME);
        }

        boolean alreadyReserved = reservationRepository.existsByPlaceIdAndDateAndTime(placeId, reservationDate, reservationTime);
        if(alreadyReserved){
            throw new CustomException(ErrorCode.ALREADY_RESERVED_TIME);
        }

        Reservation saved =reservationRepository.save(
                Reservation.builder()
                        .placeId(placeId)
                        .userId(userId)
                        .content(content)
                        .date(reservationDate)
                        .time(reservationTime)
                        .build()
        );

        eventPublisher.publishEvent(ReservationCommitEvent.builder()
                        .placeId(placeId)
                        .date(reservationDate)
                        .time(reservationTime)
                        .build());


        return saved;
    }



    public List<Reservation> getUserReservationList(Long userId) {

        return reservationRepository.findAllByUserId(userId);
    }

    public List<Reservation> getPlaceReservationList(Long placeId) {

        return reservationRepository.findAllByPlaceId(placeId);
    }
}
