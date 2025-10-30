package a201.user.domain.pet.controller;

import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
public class PetController {

    @GetMapping
    public ApiResponse<?> getPetList() {
        return null;
    }
    @GetMapping("/{petId}")
    public ApiResponse<?> getPet(@PathVariable Long petId) {
        return null;
    }
    @PostMapping
    public ApiResponse<?> setPet() {
        return null;
    }
    @PatchMapping("/{petId}")
    public ApiResponse<?> updatePet(@PathVariable Long petId) {
        return null;
    }
    @DeleteMapping("/{petId}")
    public ApiResponse<?> deletePet(@PathVariable Long petId) {
        return null;
    }
}
