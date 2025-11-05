package a201.board.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import a201.board.data.entity.Place;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place, String> {

	// Place 조회
    Optional<Place> findById(String placeId);
	
}
