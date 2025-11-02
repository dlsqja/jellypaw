package a201.user.domain.pet.dto;

import a201.user.domain.pet.entity.Pet;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PetSimpleResponse {

    private Long petId;
    private String name;
    private String photoUrl;

    public static PetSimpleResponse from(Pet pet) {

        return PetSimpleResponse.builder()
                .petId(pet.getId())
                .name(pet.getName())
                .photoUrl(pet.getPhotoUrl())
                .build();
    }
}