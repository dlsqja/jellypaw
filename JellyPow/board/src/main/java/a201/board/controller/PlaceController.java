package a201.board.controller;

import org.springframework.web.bind.annotation.*;

import a201.board.data.request.PlaceCreateRequest;
import a201.board.data.request.PlaceUpdateRequest;
import a201.board.data.response.PlaceResponse;
import a201.board.service.PlaceService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;

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

}
