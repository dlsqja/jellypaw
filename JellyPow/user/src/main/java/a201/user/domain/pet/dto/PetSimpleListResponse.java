package a201.user.domain.pet.dto;

import a201.user.domain.pet.entity.Pet;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class PetSimpleListResponse {

    private List<PetSimpleResponse> petSimpleList;

    public static PetSimpleListResponse from(List<Pet> petList) {

        List<PetSimpleResponse> responseList = petList.stream().map(PetSimpleResponse::from).toList();

        return PetSimpleListResponse.builder()
                .petSimpleList(responseList)
                .build();
    }
}
