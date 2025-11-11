package a201.board.controller;

import org.springframework.web.bind.annotation.*;

import a201.board.data.entity.Place;
import a201.board.data.request.PlaceCreateRequest;
import a201.board.data.request.PlaceUpdateRequest;
import a201.board.data.response.PlaceResponse;
import a201.board.data.response.PlaceSearchResponse;
import a201.board.service.PlaceService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

	// Place 생성
    @PostMapping
    public ApiResponse<PlaceResponse> createPlace(@RequestBody PlaceCreateRequest placeCreateRequest) {
        return ApiResponse.success(PlaceResponse.from(placeService.createPlace(placeCreateRequest)));
    }

	// Place 조회
    @GetMapping("/{code}")
    public ApiResponse<PlaceResponse> getPlaceByCode(@PathVariable String code) {
        return ApiResponse.success(PlaceResponse.from(placeService.getPlaceByCode(code)));
    }

	// Place 수정
	@PutMapping("/{code}")
	public ApiResponse<PlaceResponse> updatePlace(@PathVariable String code, @RequestBody PlaceUpdateRequest placeUpdateRequest) {
		return ApiResponse.success(PlaceResponse.from(placeService.updatePlace(code, placeUpdateRequest)));
	}

	// Place 검색 (title에서 LIKE 검색, 최대 10개)
	@GetMapping("/search")
	public ApiResponse<List<PlaceResponse>> searchPlaces(@RequestParam String title) {
		List<PlaceResponse> places = placeService.searchPlaces(title).stream()
				.map(PlaceResponse::from)
				.collect(Collectors.toList());
		return ApiResponse.success(places);
	}

	// Place 검색 (title에서 LIKE 검색, cursor 기반 - 무한스크롤용)
	@GetMapping("/search/cursor")
	public ApiResponse<PlaceSearchResponse> searchPlacesWithCursor(
			@RequestParam String title,
			@RequestParam(required = false) Long cursor) {
		
		List<Place> places = placeService.searchPlacesWithCursor(title, cursor);
		PlaceSearchResponse response = PlaceSearchResponse.from(places);
		return ApiResponse.success(response);
	}

}
