package a201.user.domain.pet.repository;

import a201.user.domain.pet.entity.UserPet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPetRepository extends JpaRepository<UserPet, Long> {
    Optional<UserPet> findByPetId(Long petId);
    Optional<UserPet> findByUserId(Long userId);
    List<UserPet> findAllByUserId(Long userId);
    Optional<UserPet> findByPetIdAndUserId(Long petId, Long userId);
    boolean existsByPetId(Long petId);
}
