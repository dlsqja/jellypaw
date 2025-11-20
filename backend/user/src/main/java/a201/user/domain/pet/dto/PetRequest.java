package a201.user.domain.pet.dto;

import a201.user.domain.pet.entity.Pet;
import a201.user.domain.pet.enums.Gender;
import a201.user.domain.pet.enums.Species;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PetRequest {

    private String name;
    private Species species;
    private Gender gender;
    private Integer age;
    private Float weight;

    public Pet toEntity(String photoUrl, String code) {
        return Pet.builder()
                .name(this.name)
                .species(this.species)
                .gender(this.gender)
                .age(this.age)
                .weight(this.weight)
                .code(code)
                .photoUrl(photoUrl)
                .build();
    }

}
