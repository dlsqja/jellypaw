package a201.post.service;

import a201.post.data.entity.Image;
import a201.post.data.entity.Post;
import a201.post.data.entity.PostUser;
import a201.post.data.request.PostRequest;
import a201.post.data.request.PostUpdateRequest;
import a201.post.data.response.PostResponse;
import a201.post.enums.Category;
import a201.post.enums.Visibility;
import a201.post.repository.PostRepository;
import a201.post.repository.PostUserRepository;
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
public class PostService {

    private final PostRepository postRepository;
    private final PostUserRepository postUserRepository;
    private final S3Service s3Service;

    public PostResponse getPost(Long userId, Long postId) {

        Post findPost = postRepository.getPostById(postId);
        Visibility visibility =  findPost.getVisibility();

        if(visibility == Visibility.PRIVATE){
            if(!findPost.getUserId().equals(userId)){
                throw new RuntimeException();
            }
        }

        PostResponse postResponse = PostResponse.fromEntity(findPost);
        List<String> imageLinks = findPost.getImages().stream()
                .map(Image::getImageLink)
                .toList();
        postResponse.setImages(imageLinks);
        //TODO:: 조회수 추가 이벤트 발생

        return postResponse;
    }

    public void createPost(Long userId, PostRequest postRequest) {

        Post newPost = postRequest.toEntity();
        PostUser postUser = postUserRepository.findByUserId(userId);
        newPost.setUserId(postUser);

        postRepository.save(newPost);

        List<MultipartFile> newImages = postRequest.getNewImages();
        String categoryString = postRequest.getCategory().name();
        List<Image> images = new ArrayList<>();

        for(MultipartFile file : newImages) {
            String keyPath = s3Service.uploadPostImage(file,categoryString);

            Image image = Image.builder()
                    .post(newPost)
                    .imageLink(keyPath)
                    .build();

            images.add(image);
        }

        newPost.setImages(images);

        postRepository.save(newPost);

        //TODO:: 생성 이벤트 발생
    }

    public void updatePost(Long userId, Long postId, PostUpdateRequest postRequest) {

        Post post = postRepository.getPostById(postId);


        List<Image> images = post.getImages();

        //이미지 삭제
        Set<String> removeImageSet = new HashSet<>(postRequest.getRemoveImages());

        images.removeIf(image -> removeImageSet.contains(image.getImageLink()));

        for(String removeImage : postRequest.getRemoveImages()) {
            s3Service.deleteFile(removeImage);
        }

        //이미지 추가
        String categoryString = post.getCategory().name();
        for(MultipartFile file : postRequest.getNewImages()) {
            String keyPath = s3Service.uploadPostImage(file,categoryString);

            Image image = Image.builder()
                    .post(post)
                    .imageLink(keyPath)
                    .build();

            images.add(image);
        }

        //TODO:: 업데이트 이벤트 발생
    }

    public void deletePost(Long userId, Long postId) {

        Post post = postRepository.getPostById(postId);

        List<Image> images = post.getImages();
        for(Image image : images) {
            s3Service.deleteFile(image.getImageLink());
        }

        postRepository.deleteById(postId);

        //TODO:: 삭제 이벤트 발생

    }
}

