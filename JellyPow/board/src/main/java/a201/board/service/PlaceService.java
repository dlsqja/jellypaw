package a201.board.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.*;
import a201.board.data.entity.Place;
import a201.board.data.request.PlaceCreateRequest;
import a201.board.repository.PlaceRepository;
import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;

@Service
@Transactional
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;

	// Place 생성 (없을 경우에만 생성)
	public Place createPlace(PlaceCreateRequest placeCreateRequest) {
		return placeRepository.findById(placeCreateRequest.getPlaceId())
				.orElseGet(() -> placeRepository.save(placeCreateRequest.toEntity()));
	}

	// Place 조회
	public Place getPlaceById(String placeId) {
		return placeRepository.findById(placeId).orElseThrow(() -> new CustomException(ErrorCode.PLACE_NOT_FOUND));
	}
}
