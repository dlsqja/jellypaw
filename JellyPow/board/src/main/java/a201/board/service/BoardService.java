package a201.board.service;

import a201.board.data.entity.Image;
import a201.board.data.entity.Place;
import a201.board.data.entity.Board;
import a201.board.data.entity.BoardUser;
import a201.board.data.request.BoardRequest;
import a201.board.data.request.BoardUpdateRequest;
import a201.board.data.request.PlaceCreateRequest;
import a201.board.data.response.BoardResponse;
import a201.board.repository.BoardRepository;
import a201.board.repository.BoardUserRepository;
import a201.common.enums.Visibility;
import a201.common.event.BoardCreateEvent;
import a201.common.event.BoardUpdateEvent;
import a201.common.s3.S3Service;
import a201.common.exception.CustomException;
import a201.common.enums.ErrorCode;
import a201.common.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardUserRepository boardUserRepository;
    private final S3Service s3Service;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final PlaceService placeService;

    public BoardResponse getPost(Long userId, Long postId) {

        Board findBoard = boardRepository.getBoardById(postId);
        Visibility visibility =  findBoard.getVisibility();

        if(visibility == Visibility.PRIVATE){
            if(!findBoard.getUserId().equals(userId)){
                throw new RuntimeException();
            }
        }

        BoardResponse boardResponse = BoardResponse.fromEntity(findBoard);
        List<String> imageLinks = findBoard.getImages().stream()
                .map(Image::getImageLink)
                .toList();
        boardResponse.setImages(imageLinks);

        //TODO:: 조회수 추가 이벤트 발생
        kafkaTemplate.send("board-view-topic", String.valueOf(postId));

        return boardResponse;
    }

    public void createPost(Long userId, BoardRequest boardRequest, PlaceCreateRequest placeRequest) {

        Board newBoard = boardRequest.toEntity();
        BoardUser boardUser = boardUserRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        newBoard.setUserId(boardUser);

        boardRepository.save(newBoard);

        List<MultipartFile> newImages = boardRequest.getNewImages();
        String categoryString = boardRequest.getCategory().name();
        List<Image> images = new ArrayList<>();
        List<String> eventImages = new ArrayList<>();

        if(newImages!=null){
            for(MultipartFile file : newImages) {
                String keyPath = s3Service.uploadPostImage(file,categoryString);
                eventImages.add(keyPath);
                Image image = Image.builder()
                        .board(newBoard)
                        .imageLink(keyPath)
                        .build();

                images.add(image);
            }
        }


        newBoard.setImages(images);

		Place place = placeService.createPlace(placeRequest);
		newBoard.setPlaceId(place.getId());

        boardRepository.save(newBoard);


        //TODO:: 생성 이벤트 발생
        BoardCreateEvent boardCreateEvent = BoardCreateEvent.builder()
                .id(newBoard.getId())
                .userId(boardUser.getId())
                .category(boardRequest.getCategory())
                .title(boardRequest.getTitle())
                .content(boardRequest.getContent())
                .placeId(place.getId())
                .starRating(boardRequest.getStarRating())
                .createdAt(newBoard.getCreatedAt())
                .visibility(boardRequest.getVisibility())
                .build();

        boardCreateEvent.setUserId(boardUser.getId());

        kafkaTemplate.send("board-create-topic", JsonUtil.toJsonString(boardCreateEvent));

    }

    public void updatePost(Long userId, Long postId, BoardUpdateRequest postRequest) {

        Board board = boardRepository.getBoardById(postId);

        board.setCategory(postRequest.getCategory());
        board.setTitle(postRequest.getTitle());
        board.setContent(postRequest.getContent());
        board.setPlaceId(postRequest.getPlaceId());
        board.setStarRating(postRequest.getStarRating());
        board.setVisibility(postRequest.getVisibility());


        List<Image> images = board.getImages();


        //이미지 삭제
        List<String> removeImages = postRequest.getRemoveImages();
        if(removeImages!=null){
            Set<String> removeImageSet = new HashSet<>(removeImages);

            images.removeIf(image -> removeImageSet.contains(image.getImageLink()));

            for(String removeImage : postRequest.getRemoveImages()) {
                s3Service.deleteFile(removeImage);
            }
        }

        List<MultipartFile> newImages = postRequest.getNewImages();
        if(newImages!=null){
            //이미지 추가
            String categoryString = board.getCategory().name();
            for(MultipartFile file : newImages) {
                String keyPath = s3Service.uploadPostImage(file,categoryString);

                Image image = Image.builder()
                        .board(board)
                        .imageLink(keyPath)
                        .build();

                images.add(image);
            }
        }

        boardRepository.save(board);

        //TODO:: 업데이트 이벤트 발생
        BoardUpdateEvent boardUpdateEvent = BoardUpdateEvent.builder()
                .id(board.getId())
                .category(board.getCategory())
                .title(board.getTitle())
                .content(board.getContent())
                .placeId(board.getPlaceId())
                .starRating(board.getStarRating())
                .visibility(board.getVisibility())
                .build();

        kafkaTemplate.send("board-update-topic", JsonUtil.toJsonString(boardUpdateEvent));
    }

    public void deletePost(Long userId, Long postId) {

        Board board = boardRepository.getBoardById(postId);

        List<Image> images = board.getImages();
        if(images!=null){
            for(Image image : images) {
                s3Service.deleteFile(image.getImageLink());
            }
        }

        Long deleteId = board.getId();

        boardRepository.deleteById(postId);

        //TODO:: 삭제 이벤트 발생
        kafkaTemplate.send("board-delete-topic", String.valueOf(deleteId));
    }
}

