package a201.reservation.global.event;

import a201.reservation.domain.availableTime.entity.AvailableTime;
import a201.reservation.domain.availableTime.repository.AvailableTimeRepository;
import a201.reservation.global.enums.TimeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;

import static org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationMongoUpdater {

    private final AvailableTimeRepository availableTimeRepository;

    @TransactionalEventListener(phase = AFTER_COMMIT)
    public void handleReservationCreated(ReservationCommitEvent event) {
        try {
            AvailableTime availableTime = availableTimeRepository
                    .findAvailableTimeByPlaceIdAndDate(event.getPlaceId(), event.getDate())
                    .orElseThrow(() -> new IllegalStateException("예약 직후인데 몽고에 타임테이블이 없음"));

            Map<String, TimeStatus> table = availableTime.getTimeTable();
            String key = event.getTime().toString();

            // 멱등하게
            table.put(key, TimeStatus.BLOCKED);

            availableTimeRepository.save(availableTime);
        } catch (Exception e) {
            // 여기서 재시도 테이블에 적어두거나, 로그만 남겨도 됨
            log.error("Mongo 슬롯 막기 실패: placeId={}, date={}, time={}",
                    event.getPlaceId(), event.getDate(), event.getTime(), e);
        }
    }
}