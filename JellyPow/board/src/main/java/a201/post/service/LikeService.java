package a201.post.service;

import a201.post.data.entity.Like;
import a201.post.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;

    public Like addLike(Like like) {
        return likeRepository.save(like);
    }

    public void removeLike(Long id) {
        likeRepository.deleteById(id);
    }

    public List<Like> getLikesByPost(Long postId) {
        return likeRepository.findByPostId(postId);
    }
}

