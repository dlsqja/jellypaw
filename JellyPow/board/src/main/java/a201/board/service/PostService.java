package a201.board.service;

import a201.board.data.entity.Image;
import a201.board.data.entity.Post;
import a201.board.data.entity.PostUser;
import a201.board.data.request.PostRequest;
import a201.board.data.request.PostUpdateRequest;
import a201.board.repository.PostRepository;
import a201.board.repository.PostUserRepository;
import a201.common.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

    public void createPost(Long userId, PostRequest postRequest) {

        Post newPost = postRequest.toEntity();
        PostUser postUser = postUserRepository.findByUserId(userId);
        newPost.setUserId(postUser);

        List<MultipartFile> images = postRequest.getNewImages();
        if(images.isEmpty()){

        }

        postRepository.save(newPost);

        //생성 이벤트 발생
    }

    public void updatePost(Long userId, Long postId, PostUpdateRequest postRequest) {

        Post post = postRepository.getPostById(postId);
        List<Image> images = post.getImages();
        Set<String> removeImageSet = new HashSet<>(postRequest.getRemoveImages());

        images.removeIf(image -> removeImageSet.contains(image.getImageLink()));

        for(String removeImage : postRequest.getRemoveImages()) {
            // 이미지 s3 삭제 로직
        }

        // 업데이트 이벤트 발생
    }

    public void deletePost(Long userId, Long postId) {

        Post post = postRepository.getPostById(postId);

        List<Image> images = post.getImages();
        if(!images.isEmpty()){
            //s3 이미지 삭제 로직
        }

        postRepository.deleteById(postId);

        //삭제 이벤트 발생

    }
}

