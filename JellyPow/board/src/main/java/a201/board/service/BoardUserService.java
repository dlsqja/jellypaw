package a201.board.service;

import a201.board.entity.PostUser;
import a201.board.repository.PostUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class BoardUserService {

    private final PostUserRepository userRepository;

    public PostUser createUser(PostUser user) {
        return userRepository.save(user);
    }

    public PostUser getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public PostUser updateUser(PostUser user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

