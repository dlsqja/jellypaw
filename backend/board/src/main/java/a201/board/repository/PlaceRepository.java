package a201.board.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import a201.board.data.entity.Place;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

	// Place 조회
    Optional<Place> findById(Long placeId);

	Optional<Place> findByCode(String code);

	// Place 검색 (title에서 LIKE 검색, 최대 10개)
	List<Place> findFirst10ByTitleContaining(String title);

	// Place 검색 (title에서 LIKE 검색, cursor 기반 - id가 cursor보다 큰 것 중 최대 10개)
	List<Place> findFirst10ByTitleContainingAndIdGreaterThan(String title, Long cursor);
}
