package a201.board.service;

import a201.board.data.entity.Post;
import a201.board.data.entity.PostUser;
import a201.board.data.request.PostRequest;
import a201.board.repository.PostRepository;
import a201.board.repository.PostUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostUserRepository postUserRepository;

    public void createPost(Long userId, PostRequest postRequest) {

        Post newPost = postRequest.toEntity();
        PostUser postUser = postUserRepository.findByUserId(userId);
        newPost.setUserId(postUser);

        //이미지 저장 필요
        Post post = postRepository.save(newPost);

    }

    public Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }
    public Post updatePost(Post post) {
        return postRepository.save(post);
    }

    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
    }
}

