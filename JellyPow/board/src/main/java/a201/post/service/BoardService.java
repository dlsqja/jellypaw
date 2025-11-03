package a201.post.service;

import a201.post.data.entity.Image;
import a201.post.data.entity.Board;
import a201.post.data.entity.BoardUser;
import a201.post.data.request.BoardRequest;
import a201.post.data.request.BoardUpdateRequest;
import a201.post.data.response.BoardResponse;
import a201.post.enums.Visibility;
import a201.post.repository.BoardRepository;
import a201.post.repository.BoardUserRepository;
import a201.common.s3.S3Service;
import lombok.RequiredArgsConstructor;
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

        return boardResponse;
    }

    public void createPost(Long userId, BoardRequest boardRequest) {

        Board newBoard = boardRequest.toEntity();
        BoardUser boardUser = boardUserRepository.findByUserId(userId);
        newBoard.setUserId(boardUser);

        boardRepository.save(newBoard);

        List<MultipartFile> newImages = boardRequest.getNewImages();
        String categoryString = boardRequest.getCategory().name();
        List<Image> images = new ArrayList<>();

        for(MultipartFile file : newImages) {
            String keyPath = s3Service.uploadPostImage(file,categoryString);

            Image image = Image.builder()
                    .board(newBoard)
                    .imageLink(keyPath)
                    .build();

            images.add(image);
        }

        newBoard.setImages(images);

        boardRepository.save(newBoard);

        //TODO:: 생성 이벤트 발생
    }

    public void updatePost(Long userId, Long postId, BoardUpdateRequest postRequest) {

        Board board = boardRepository.getBoardById(postId);


        List<Image> images = board.getImages();

        //이미지 삭제
        Set<String> removeImageSet = new HashSet<>(postRequest.getRemoveImages());

        images.removeIf(image -> removeImageSet.contains(image.getImageLink()));

        for(String removeImage : postRequest.getRemoveImages()) {
            s3Service.deleteFile(removeImage);
        }

        //이미지 추가
        String categoryString = board.getCategory().name();
        for(MultipartFile file : postRequest.getNewImages()) {
            String keyPath = s3Service.uploadPostImage(file,categoryString);

            Image image = Image.builder()
                    .board(board)
                    .imageLink(keyPath)
                    .build();

            images.add(image);
        }

        //TODO:: 업데이트 이벤트 발생
    }

    public void deletePost(Long userId, Long postId) {

        Board board = boardRepository.getBoardById(postId);

        List<Image> images = board.getImages();
        for(Image image : images) {
            s3Service.deleteFile(image.getImageLink());
        }

        boardRepository.deleteById(postId);

        //TODO:: 삭제 이벤트 발생

    }
}

