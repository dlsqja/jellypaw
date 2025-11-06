package a201.reservation.domain.availableTime.dto;


import a201.reservation.domain.availableTime.entity.AvailableTime;
import a201.reservation.global.enums.TimeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableTimeResponse {

    private Long placeId;
    private LocalDate date;
    private Map<String, TimeStatus> timeTable;

    public static AvailableTimeResponse from(AvailableTime availableTime){
        return AvailableTimeResponse.builder()
                .placeId(availableTime.getPlaceId())
                .date(availableTime.getDate())
                .timeTable(availableTime.getTimeTable())
                .build();
    }

}
