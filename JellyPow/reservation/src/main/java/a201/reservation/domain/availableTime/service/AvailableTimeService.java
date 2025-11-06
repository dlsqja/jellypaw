package a201.reservation.domain.availableTime.service;

import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import a201.reservation.domain.availableTime.entity.AvailableTime;
import a201.reservation.global.enums.TimeStatus;
import a201.reservation.domain.availableTime.repository.AvailableTimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AvailableTimeService {

    private static final int AVAILABLE_DAYS = 30;
    private static final int AVAILABLE_TIMES = 48;
    private final AvailableTimeRepository availableTimeRepository;

    //place 가 예약가능한 상태(사용자 인증)이 되면 호출해서 db 에 30일치 예약 시간을 넣음
    public void createInitialAvailableTimes(Long placeId) {

        LocalDate today = LocalDate.now();
        List<AvailableTime> timesToInsert = new ArrayList<>();

        for(int i = 0; i < AVAILABLE_DAYS; i++){
            LocalDate date = today.plusDays(i);

            if(availableTimeRepository.existsByPlaceIdAndDate(placeId, date)) continue;

            AvailableTime availableTime = AvailableTime.builder()
                    .placeId(placeId)
                    .date(date)
                    .timeTable(createAvailableTimeTable())
                    .build();

            timesToInsert.add(availableTime);
        }
        availableTimeRepository.saveAll(timesToInsert);
    }

    private Map<String, TimeStatus> createAvailableTimeTable() {

        Map <String, TimeStatus> timeTable = new LinkedHashMap<>();
        for(int i = 0; i < AVAILABLE_TIMES; i++){
            timeTable.put(String.valueOf(i), TimeStatus.AVAILABLE);
        }
        return timeTable;
    }

    //하루마다 30일 전 날짜 삭제, 30일 후 날짜 생성으로 오늘부터 총 30일만 DB에 있도록 함.
    public void slideOneDay() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate newDate = today.plusDays(AVAILABLE_DAYS - 1);

        List<AvailableTime> all = availableTimeRepository.findAllPlaceIds();
        Set<Long> placeIds = new HashSet<>();
        for(AvailableTime availableTime : all){
            placeIds.add(availableTime.getPlaceId());
        }

        List<AvailableTime> timeToInsert = new ArrayList<>();
        for(Long placeId : placeIds){
            //오늘 이전의 데이터 삭제
            availableTimeRepository.deleteByPlaceIdAndDateLessThan(placeId, today);

            if(!availableTimeRepository.existsByPlaceIdAndDate(placeId, newDate)){
                AvailableTime newTimeTable = AvailableTime.builder()
                        .placeId(placeId)
                        .date(newDate)
                        .timeTable(createAvailableTimeTable())
                        .build();

                timeToInsert.add(newTimeTable);
            }
        }
        if(!timeToInsert.isEmpty()) {
            availableTimeRepository.saveAll(timeToInsert);
        }
    }

    public AvailableTime getAvailableTimeByPlaceIdAndDate(Long placeId, LocalDate date) {

        return availableTimeRepository.findAvailableTimeByPlaceIdAndDate(placeId, date)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
    }
}
