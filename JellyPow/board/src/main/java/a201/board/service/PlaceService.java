package a201.board.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.*;
import a201.board.data.entity.Place;
import a201.board.data.request.PlaceCreateRequest;
import a201.board.repository.PlaceRepository;
import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;

	// Place 생성
	public Place createPlace(PlaceCreateRequest placeCreateRequest) {
		return placeRepository.save(placeCreateRequest.toEntity());
	}

	// Place 조회
	public Place getPlaceById(Long id) {
		return placeRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.PLACE_NOT_FOUND));
	}
}
