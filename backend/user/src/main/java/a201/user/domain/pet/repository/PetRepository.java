package a201.user.domain.pet.repository;

import a201.user.domain.pet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findAllById(Long petId);
    Optional<Pet> findByCode(String code);
}
