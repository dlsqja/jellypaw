package a201.board.service;

import a201.board.entity.BoardUser;
import a201.board.repository.BoardUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class BoardUserService {

    private final BoardUserRepository userRepository;

    public BoardUser createUser(BoardUser user) {
        return userRepository.save(user);
    }

    public BoardUser getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public BoardUser updateUser(BoardUser user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

