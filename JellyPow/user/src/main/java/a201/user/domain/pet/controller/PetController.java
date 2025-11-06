package a201.user.domain.pet.controller;

import a201.common.response.ApiResponse;
import a201.user.domain.pet.dto.PetCodeRequest;
import a201.user.domain.pet.dto.PetRequest;
import a201.user.domain.pet.dto.PetResponse;
import a201.user.domain.pet.dto.PetSimpleListResponse;
import a201.user.domain.pet.entity.Pet;
import a201.user.domain.pet.repository.PetRepository;
import a201.user.domain.pet.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Pet", description = "반려동물 관리 API")
@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @Operation(summary = "반려동물 목록 조회", description = "사용자의 반려동물 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<PetSimpleListResponse> getPetList(@RequestHeader("X-User-Id") Long userId) {

        List<Pet> petList = petService.getPetList(userId);

        return ApiResponse.success(PetSimpleListResponse.from(petList));
    }

    @Operation(summary = "반려동물 조회", description = "특정 반려동물 정보를 조회합니다.")
    @GetMapping("/{petId}")
    public ApiResponse<PetResponse> getPet(@PathVariable Long petId) {

        Pet pet = petService.getPet(petId);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @Operation(summary = "반려동물 등록", description = "새로운 반려동물을 등록합니다.")
    @PostMapping
    public ApiResponse<PetResponse> registerPet(@RequestHeader("X-User-Id") Long userId,
                                                @RequestPart("petRequest") PetRequest petRequest,
                                                @RequestPart(value = "petprofileImg", required = false) MultipartFile petProfileImg) {

        Pet pet = petService.registerPet(userId, petRequest, petProfileImg);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @Operation(summary = "코드로 반려동물 등록", description = "코드를 사용하여 반려동물을 등록합니다.")
    @PostMapping("/code")
    public ApiResponse<PetResponse> registerPetByCode(@RequestHeader("X-User-id") Long userId,
                                                      @RequestBody PetCodeRequest petCodeRequest) {

        Pet pet = petService.registerPetByCode(userId, petCodeRequest);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @Operation(summary = "반려동물 정보 수정", description = "반려동물의 정보를 수정합니다.")
    @PatchMapping("/{petId}")
    public ApiResponse<PetResponse> updatePetInfo(@RequestHeader("X-User-Id") Long userId,
                                                  @PathVariable Long petId,
                                                  @RequestBody PetRequest petRequest) {

        Pet pet = petService.updatePetInfo(petId, petRequest);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @Operation(summary = "반려동물 프로필 이미지 수정", description = "반려동물의 프로필 이미지를 수정합니다.")
    @PatchMapping("/img/{petId}")
    public ApiResponse<PetResponse> updatePetImg(@RequestHeader("X-User-Id") Long userId,
                                                 @PathVariable Long petId,
                                                 @RequestPart(value = "petProfileImg", required = false) MultipartFile petProfileImg) {

        Pet pet = petService.updatePetImg(petId, petProfileImg);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @Operation(summary = "반려동물 삭제", description = "반려동물을 삭제합니다.")
    @DeleteMapping("/{petId}")
    public ApiResponse<?> deletePet(@RequestHeader("X-User-Id") Long userId,
                                    @PathVariable Long petId) {

        petService.deletePet(userId, petId);

        return ApiResponse.success(null);
    }
}
