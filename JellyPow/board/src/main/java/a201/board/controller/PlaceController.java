package a201.board.controller;

import org.springframework.web.bind.annotation.*;

import a201.board.data.entity.Place;
import a201.board.data.request.PlaceCreateRequest;
import a201.board.data.request.PlaceUpdateRequest;
import a201.board.data.response.PlaceResponse;
import a201.board.data.response.PlaceSearchResponse;
import a201.board.service.PlaceService;
import a201.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

	// Place 생성
	@Operation(summary = "Place 생성", description = "Place를 생성합니다.")
    @PostMapping
    public ApiResponse<PlaceResponse> createPlace(@RequestBody PlaceCreateRequest placeCreateRequest) {
        return ApiResponse.success(PlaceResponse.from(placeService.createPlace(placeCreateRequest)));
    }

	// Place 조회
	@Operation(summary = "Place 조회", description = "Place를 조회합니다.")
    @GetMapping("/{placeId}")
    public ApiResponse<PlaceResponse> getPlaceByCode(@PathVariable Long placeId) {
        return ApiResponse.success(PlaceResponse.from(placeService.getPlaceById(placeId)));
    }

	// Place 수정
	@Operation(summary = "Place 수정", description = "Place를 수정합니다.")
	@PutMapping("/{placeId}")
	public ApiResponse<PlaceResponse> updatePlace(@PathVariable Long placeId, @RequestBody PlaceUpdateRequest placeUpdateRequest) {
		return ApiResponse.success(PlaceResponse.from(placeService.updatePlace(placeId, placeUpdateRequest)));
	}

	// Place 검색 (title에서 LIKE 검색, 최대 10개)
	@Operation(summary = "Place 검색", description = "Place를 검색합니다.")
	@GetMapping("/search")
	public ApiResponse<List<PlaceResponse>> searchPlaces(@RequestParam String title) {
		List<PlaceResponse> places = placeService.searchPlaces(title).stream()
				.map(PlaceResponse::from)
				.collect(Collectors.toList());
		return ApiResponse.success(places);
	}

	// Place 검색 (title에서 LIKE 검색, cursor 기반 - 무한스크롤용)
	@Operation(summary = "Place 검색 (cursor 기반)", description = "Place를 검색합니다. (cursor 기반 - 무한스크롤용)")
	@GetMapping("/search/cursor")
	public ApiResponse<PlaceSearchResponse> searchPlacesWithCursor(
			@RequestParam String title,
			@RequestParam(required = false) Long cursor) {
		
		List<Place> places = placeService.searchPlacesWithCursor(title, cursor);
		PlaceSearchResponse response = PlaceSearchResponse.from(places);
		return ApiResponse.success(response);
	}

}
