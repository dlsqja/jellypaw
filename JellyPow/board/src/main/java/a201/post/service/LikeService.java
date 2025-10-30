package a201.post.service;

import a201.post.data.entity.Like;
import a201.post.data.entity.Post;
import a201.post.data.entity.PostUser;
import a201.post.repository.LikeRepository;
import a201.post.repository.PostRepository;
import a201.post.repository.PostUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {

    private final PostRepository postRepository;
    private final PostUserRepository postUserRepository;
    private final LikeRepository likeRepository;

    public Like addLike(Long postId,Long userId) {
        Post post = postRepository.getPostById(postId);
        PostUser postUser = postUserRepository.getPostUserByUserId(userId);

        Like like = Like.builder()
                .post(post)
                .userId(postUser)
                .build();

        return likeRepository.save(like);
    }

    public void removeLike(Long postId,Long userId) {
        likeRepository.deleteByUserId_IdAndPost_Id(userId,postId);
    }

    public List<Like> getLikesByPost(Long userId) {

        return likeRepository.findAllByUserId_Id(userId);
    }
}

