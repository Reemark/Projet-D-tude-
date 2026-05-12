package uncharted.demo.service;

import org.springframework.stereotype.Service;
import uncharted.demo.dto.UserDto;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.User;
import uncharted.demo.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto.Response getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        return toResponse(user);
    }

    public UserDto.Response updatePseudo(String email, String newPseudo) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        user.setPseudo(newPseudo);
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
