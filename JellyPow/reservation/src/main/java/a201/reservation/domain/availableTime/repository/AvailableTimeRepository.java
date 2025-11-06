package a201.reservation.domain.availableTime.repository;

import a201.reservation.domain.availableTime.entity.AvailableTime;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AvailableTimeRepository extends MongoRepository<AvailableTime, String> {

    Optional<AvailableTime> findByPlaceIdAndDate(Long placeId, LocalDate date);
    boolean existsByPlaceIdAndDate(Long placeId, LocalDate date);

    /*
    mongoDB 용 @Query : value = "{}" -> 조건, 여기선 조건 없으니 전체
    fields = "{placeId : 1}" -> placeId를 포함(1)해라, 0은 그거 제외 나머지
     */
    @Query(value = "{}", fields = "{'placeId' : 1}")
    List<AvailableTime> findAllPlaceIds();

    void deleteByPlaceIdAndDateLessThan(Long placeId, LocalDate date);

}
