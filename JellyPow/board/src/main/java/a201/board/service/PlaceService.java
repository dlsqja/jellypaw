package a201.board.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.*;
import a201.board.data.entity.Place;
import a201.board.data.request.PlaceCreateRequest;
import a201.board.data.request.PlaceUpdateRequest;
import a201.board.repository.PlaceRepository;
import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import a201.common.util.JsonUtil;

@Service
@Transactional
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
	private final KafkaTemplate<String, String> kafkaTemplate;

	// Place 생성 (없을 경우에만 생성)
	public Place createPlace(PlaceCreateRequest placeCreateRequest) {
		return placeRepository.findByCode(placeCreateRequest.getPlaceCode())
				.orElseGet(() -> placeRepository.save(placeCreateRequest.toEntity()));
	}

	// Place 조회
	public Place getPlaceByCode(String code) {
		return placeRepository.findByCode(code).orElseThrow(() -> new CustomException(ErrorCode.PLACE_NOT_FOUND));
	}

	// Place 수정
	public Place updatePlace(String code, PlaceUpdateRequest placeUpdateRequest) {
		Place place = getPlaceByCode(code);
		place.setTitle(placeUpdateRequest.getTitle());
		place.setAddress(placeUpdateRequest.getAddress());
		place.setOpeningHours(placeUpdateRequest.getOpeningHoursString(placeUpdateRequest.getOpeningHours()));
		place.setPhoneNumber(placeUpdateRequest.getPhoneNumber());
		place.setLink(placeUpdateRequest.getLink());
		place.setUserId(placeUpdateRequest.getUserId());

		// userId가 존재하면(처음 업데이트 되는거면 kafka등록)
		if (place.getUserId() == null && placeUpdateRequest.getUserId() != null) {
			kafkaTemplate.send("place-update-topic", JsonUtil.toJsonString(null));
		}
		
		return placeRepository.save(place);
	}	
}
