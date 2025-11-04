package a201.board.service;

import a201.board.data.entity.Like;
import a201.board.data.entity.Board;
import a201.board.data.entity.BoardUser;
import a201.board.repository.LikeRepository;
import a201.board.repository.BoardRepository;
import a201.board.repository.BoardUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {

    private final BoardRepository boardRepository;
    private final BoardUserRepository boardUserRepository;
    private final LikeRepository likeRepository;

    public Like addLike(Long postId,Long userId) {
        Board board = boardRepository.getBoardById(postId);
        BoardUser boardUser = boardUserRepository.getPostUserByUserId(userId);

        Like like = Like.builder()
                .board(board)
                .userId(boardUser)
                .build();

        //TODO::좋아요 이벤트 발생 
        return likeRepository.save(like);
    }

    public void removeLike(Long postId,Long userId) {

        likeRepository.deleteByUserId_IdAndBoard_Id(userId,postId);
        //TODO::삭제 이벤트 발생
    }

    public List<Like> getLikesByMe(Long userId) {
        
        return likeRepository.findAllByUserId_Id(userId);
    }
}

