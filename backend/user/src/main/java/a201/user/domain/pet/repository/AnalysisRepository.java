package a201.user.domain.pet.repository;

import a201.user.domain.pet.document.AnalysisDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AnalysisRepository extends MongoRepository<AnalysisDocument, String> {
    
    List<AnalysisDocument> findByUserIdAndPetIdOrderByCreatedAtDesc(Long userId, Long petId);
    
    List<AnalysisDocument> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<AnalysisDocument> findByIdAndUserId(String id, Long userId);
}

