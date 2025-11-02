package a201.user.domain.pet.service;

import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import a201.common.s3.S3Service;
import a201.user.domain.pet.dto.PetCodeRequest;
import a201.user.domain.pet.dto.PetRequest;
import a201.user.domain.pet.dto.PetResponse;
import a201.user.domain.pet.entity.Pet;
import a201.user.domain.pet.entity.UserPet;
import a201.user.domain.pet.other.RandomCodeGenerator;
import a201.user.domain.pet.repository.PetRepository;
import a201.user.domain.pet.repository.UserPetRepository;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class PetService {

    private final UserPetRepository userPetRepository;
    private final PetRepository petRepository;
    private final S3Service s3Service;
    private final UserRepository userRepository;

    public List<Pet> getPetList(Long userId) {

        List<UserPet> userPetList = userPetRepository.findAllByUserId(userId);

        return userPetList.stream().map(UserPet::getPet).toList();
    }

    public Pet getPet(Long petId) {

        return petRepository.findById(petId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
    }

    @Transactional
    public Pet registerPet(Long userId, PetRequest petRequest, MultipartFile petProfileImg) {

        String code = RandomCodeGenerator.generateRandomCode();
        String url = s3Service.uploadPetProfileImage(petProfileImg);
        Pet pet = petRequest.toEntity(url, code);
        petRepository.save(pet);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        UserPet userPet = UserPet.builder()
                .user(user)
                .pet(pet)
                .build();

        userPetRepository.save(userPet);

        return pet;
    }

    @Transactional
    public Pet registerPetByCode(Long userId, PetCodeRequest petCodeRequest) {

        String code = petCodeRequest.getPetCode();
        Pet pet = petRepository.findByCode(code).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        UserPet userPet = UserPet.builder()
                .pet(pet)
                .user(user)
                .build();

        userPetRepository.save(userPet);

        return pet;
    }

    /*
        @Transactional 어노테이션 때문에 메서드가 끝나면
        JPA가 변경된 내용을 감지(Dirty Checking)하여 자동으로 UPDATE 쿼리를 날린다.
        따라서 petRepository.save(pet)을 호출할 필요가 없다.
     */
    @Transactional
    public Pet updatePetInfo(Long petId, PetRequest petRequest) {

        Pet pet = petRepository.findById(petId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        pet.updatePetInfo(petRequest);

        return pet;
    }

    @Transactional
    public Pet updatePetImg(Long petId, MultipartFile petProfileImg) {

        Pet pet = petRepository.findById(petId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        String newUrl = s3Service.uploadPetProfileImage(petProfileImg);
        pet.updatePhotoUrl(newUrl);

        //S3 삭제를 먼저하지 않은 이유 : s3에 저장된 img 가 삭제되고 pet db에 url 수정중에 실패가되면 삭제된 url을 가리키게 됨
        String oldUrl = pet.getPhotoUrl();
        s3Service.deleteFile(oldUrl);
        
        return pet;
    }

    @Transactional
    public void deletePet(Long userId, Long petId) {

        UserPet  userPet = userPetRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        userPetRepository.delete(userPet);

        boolean hasOtherOwner = userPetRepository.existsByPetId(petId);
        if (!hasOtherOwner) {

            Pet pet =  petRepository.findById(petId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
            s3Service.deleteFile(pet.getPhotoUrl());
            petRepository.delete(pet);
        }
    }
}
