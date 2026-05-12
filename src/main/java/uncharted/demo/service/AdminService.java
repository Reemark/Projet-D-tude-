package uncharted.demo.service;

import org.springframework.stereotype.Service;
import uncharted.demo.dto.UserDto;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.User;
import uncharted.demo.repository.UserRepository;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto.Response> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserDto.Response deactivateUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        user.setActive(false);
        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserDto.Response activateUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        user.setActive(true);
        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserDto.Response verifySiret(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        user.setSiretVerified(true);
        user = userRepository.save(user);
        return toResponse(user);
    }

    private UserDto.Response toResponse(User user) {
        return new UserDto.Response(
                user.getId(),
                user.getEmail(),
                user.getPseudo(),
                user.getRole(),
                user.isActive(),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}
