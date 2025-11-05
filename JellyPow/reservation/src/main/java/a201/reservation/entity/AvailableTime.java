package a201.reservation.entity;

import a201.reservation.enums.TimeStatus;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.Map;

@Document(collection = "available_times")
@CompoundIndex(
        name = "place_date_idx",
        def = "{'placeId': 1, 'date': 1}",
        unique = true
)
@Getter
@Setter
@Builder
public class AvailableTime {

    @Id
    private String id;

    private Long placeId;

    /*
    * 30일 단위로 스케줄러 배치로 매일 추가.
    * */
    private LocalDate date;

    /*
    * 0 ~ 47 : 00:00 ~ 23:30
    * "0" : "AVAILABLE"
    * "1" : "BLOCKED
    *    ...
    * */
    private Map<String, TimeStatus> timeTable;
}
