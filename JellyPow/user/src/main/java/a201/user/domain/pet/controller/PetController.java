package a201.user.domain.pet.controller;

import a201.common.response.ApiResponse;
import a201.user.domain.pet.dto.PetCodeRequest;
import a201.user.domain.pet.dto.PetRequest;
import a201.user.domain.pet.dto.PetResponse;
import a201.user.domain.pet.dto.PetSimpleListResponse;
import a201.user.domain.pet.entity.Pet;
import a201.user.domain.pet.repository.PetRepository;
import a201.user.domain.pet.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public ApiResponse<PetSimpleListResponse> getPetList(@RequestHeader("X-User-Id") Long userId) {

        List<Pet> petList = petService.getPetList(userId);

        return ApiResponse.success(PetSimpleListResponse.from(petList));
    }

    @GetMapping("/{petId}")
    public ApiResponse<PetResponse> getPet(@PathVariable Long petId) {

        Pet pet = petService.getPet(petId);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @PostMapping
    public ApiResponse<PetResponse> registerPet(@RequestHeader("X-User-Id") Long userId,
                                                @RequestPart("petRequest") PetRequest petRequest,
                                                @RequestPart(value = "petprofileImg", required = false) MultipartFile petProfileImg) {

        Pet pet = petService.registerPet(userId, petRequest, petProfileImg);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @PostMapping("/code")
    public ApiResponse<PetResponse> registerPetByCode(@RequestHeader("X-User_id") Long userId,
                                                      @RequestBody PetCodeRequest petCodeRequest) {

        Pet pet = petService.registerPetByCode(userId, petCodeRequest);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @PatchMapping("/{petId}")
    public ApiResponse<PetResponse> updatePetInfo(@RequestHeader("X-User-Id") Long userId,
                                                  @PathVariable Long petId,
                                                  @RequestBody PetRequest petRequest) {

        Pet pet = petService.updatePetInfo(petId, petRequest);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @PatchMapping("/img/{petId}")
    public ApiResponse<PetResponse> updatePetImg(@RequestHeader("X-User-Id") Long userId,
                                                 @PathVariable Long petId,
                                                 @RequestPart(value = "petProfileImg", required = false) MultipartFile petProfileImg) {

        Pet pet = petService.updatePetImg(petId, petProfileImg);

        return ApiResponse.success(PetResponse.from(pet));
    }

    @DeleteMapping("/{petId}")
    public ApiResponse<?> deletePet(@RequestHeader("X-User-Id") Long userId,
                                    @PathVariable Long petId) {

        petService.deletePet(userId, petId);

        return ApiResponse.success(null);
    }
}
