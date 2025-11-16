package a201.user.domain.pet.controller;

import a201.common.client.AiClient;
import a201.common.response.ApiResponse;
import a201.user.domain.pet.dto.AnalysisResponse;
import a201.user.domain.pet.dto.PetCodeRequest;
import a201.user.domain.pet.dto.PetRequest;
import a201.user.domain.pet.dto.PetResponse;
import a201.user.domain.pet.dto.PetSimpleListResponse;
import a201.user.domain.pet.document.AnalysisDocument;
import a201.user.domain.pet.entity.Pet;
import a201.user.domain.pet.service.AnalysisService;
import a201.user.domain.pet.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Tag(name = "Pet", description = "반려동물 관리 API")
@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final AiClient aiClient;
    private final AnalysisService analysisService;

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

    @Operation(summary = "이미지 AI 분석", description = "이미지를 AI 서버로 전송하여 분석하고 결과를 저장합니다.")
    @PostMapping("/{petId}/analyze")
    public ApiResponse<AnalysisResponse> analyzeImage(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long petId,
            @RequestPart("file") MultipartFile file) {
        
        // AI 서버로 이미지 분석 요청
        Map<String, Object> aiResult = aiClient.analyzeImage(file);
        
        // MongoDB에 저장
        AnalysisDocument saved = analysisService.saveAnalysis(userId, petId, aiResult);
        
        // 조회용 DTO로 변환하여 반환 (testNameKo, isNormal, severity, suspectedConditions만 포함)
        AnalysisResponse response = AnalysisResponse.from(saved);
        return ApiResponse.success(response);
    }

    @Operation(summary = "반려동물 분석 결과 목록 조회", description = "특정 반려동물의 분석 결과 목록을 최신순으로 조회합니다.")
    @GetMapping("/{petId}/analysis")
    public ApiResponse<List<AnalysisResponse>> getAnalysisList(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long petId) {
        
        // MongoDB에서 userId와 petId로 조회 (최신순)
        List<AnalysisDocument> documents = analysisService.getAnalysisList(userId, petId);
        
        // DTO로 변환하여 반환
        List<AnalysisResponse> responses = documents.stream()
                .map(AnalysisResponse::from)
                .collect(java.util.stream.Collectors.toList());
        
        return ApiResponse.success(responses);
    }
}
