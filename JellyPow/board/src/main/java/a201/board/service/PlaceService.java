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
import a201.common.event.PlaceEvent;
import a201.common.exception.CustomException;
import a201.common.util.JsonUtil;

import java.util.List;

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
	public Place getPlaceById(Long placeId) {
		return placeRepository.findById(placeId).orElseThrow(() -> new CustomException(ErrorCode.PLACE_NOT_FOUND));
	}

	// Place 수정
	public Place updatePlace(Long placeId, PlaceUpdateRequest placeUpdateRequest) {
		Place place = getPlaceById(placeId);
		Long oldUserId = place.getUserId();

		place.setTitle(placeUpdateRequest.getTitle());
		place.setAddress(placeUpdateRequest.getAddress());
		place.setOpeningHours(placeUpdateRequest.getOpeningHoursString(placeUpdateRequest.getOpeningHours()));
		place.setPhoneNumber(placeUpdateRequest.getPhoneNumber());
		place.setLink(placeUpdateRequest.getLink());
		place.setUserId(placeUpdateRequest.getUserId());

		//System.out.println("oldId: " + oldUserId + ", nowId: " + placeUpdateRequest.getUserId());
		// userId가 존재하면(처음 업데이트 되는거면 kafka등록)
		if (oldUserId == null && placeUpdateRequest.getUserId() != null) {
			kafkaTemplate.send("place-available-topic", JsonUtil.toJsonString(new PlaceEvent(place.getId())));
		}

		return placeRepository.save(place);
	}

	// Place 검색 (title에서 LIKE 검색, 최대 10개)
	@Transactional(readOnly = true)
	public List<Place> searchPlaces(String title) {
		return placeRepository.findFirst10ByTitleContaining(title);
	}

	// Place 검색 (title에서 LIKE 검색, cursor 기반 - 무한스크롤용)
	@Transactional(readOnly = true)
	public List<Place> searchPlacesWithCursor(String title, Long cursor) {
		if (cursor == null || cursor == 0) {
			// 첫 요청: cursor가 없으면 처음부터
			return placeRepository.findFirst10ByTitleContaining(title);
		} else {
			// 다음 요청: cursor 이후의 데이터
			return placeRepository.findFirst10ByTitleContainingAndIdGreaterThan(title, cursor);
		}
	}

	@Transactional
	public void deletePlace(Long placeId) {
		Place place = getPlaceById(placeId);
		placeRepository.delete(place);
	}
}
