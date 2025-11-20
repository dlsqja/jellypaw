package a201.user.domain.pet.dto;

import a201.user.domain.pet.entity.Pet;
import a201.user.domain.pet.enums.Gender;
import a201.user.domain.pet.enums.Species;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PetResponse {

    private Long petId;
    private String code;
    private String name;
    private Species species;
    private String photoUrl;
    private Gender gender;
    private Integer age;
    private Float weight;

    public static PetResponse from(Pet pet) {

        return PetResponse.builder()
                .petId(pet.getId())
                .code(pet.getCode())
                .name(pet.getName())
                .species(pet.getSpecies())
                .photoUrl(pet.getPhotoUrl())
                .gender(pet.getGender())
                .age(pet.getAge())
                .weight(pet.getWeight())
                .build();
    }
}
