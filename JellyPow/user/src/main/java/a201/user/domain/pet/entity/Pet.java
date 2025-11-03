package a201.user.domain.pet.entity;


import a201.user.domain.pet.dto.PetRequest;
import a201.user.domain.pet.enums.Gender;
import a201.user.domain.pet.enums.Species;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pet")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", length = 50, nullable = false, unique = true)
    private String code;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "species", nullable = false)
    @Enumerated(EnumType.STRING)
    private Species species;

    @Column(name = "photo_url", length = 255, nullable = true)
    private String photoUrl;

    @Column(name = "gender", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Gender gender =  Gender.NON;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "weight", nullable = false)
    private Float weight;


    public void updatePetInfo(PetRequest petRequest) {
        this.name = petRequest.getName();
        this.species = petRequest.getSpecies();
        this.age = petRequest.getAge();
        this.gender = petRequest.getGender();
        this.weight = petRequest.getWeight();
    }

    public void updatePhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
