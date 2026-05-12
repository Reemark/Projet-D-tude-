package uncharted.demo.service;

import org.springframework.stereotype.Service;
import uncharted.demo.dto.HuntDto;
import uncharted.demo.model.Hunt;
import uncharted.demo.model.User;
import uncharted.demo.repository.HuntRepository;
import uncharted.demo.repository.UserRepository;

import java.util.List;

@Service
public class HuntService {

    private final HuntRepository huntRepository;
    private final UserRepository userRepository;

    public HuntService(HuntRepository huntRepository, UserRepository userRepository) {
        this.huntRepository = huntRepository;
        this.userRepository = userRepository;
    }

    public HuntDto.Response create(HuntDto.CreateRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Hunt hunt = new Hunt();
        hunt.setTitle(request.title());
        hunt.setDescription(request.description());
        hunt.setDifficulty(request.difficulty());
        hunt.setCreator(creator);
        hunt = huntRepository.save(hunt);

        return toResponse(hunt);
    }

    public List<HuntDto.Response> getAllActive() {
        return huntRepository.findByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    public HuntDto.Response getById(Integer id) {
        Hunt hunt = huntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chasse non trouvée"));
        return toResponse(hunt);
    }

    public List<HuntDto.Response> getByCreator(String email) {
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return huntRepository.findByCreator(creator).stream().map(this::toResponse).toList();
    }

    public void delete(Integer id, String email) {
        Hunt hunt = huntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chasse non trouvée"));
        if (!hunt.getCreator().getEmail().equals(email)) {
            throw new RuntimeException("Non autorisé");
        }
        huntRepository.delete(hunt);
    }

    private HuntDto.Response toResponse(Hunt hunt) {
        return new HuntDto.Response(
                hunt.getId(),
                hunt.getTitle(),
                hunt.getDescription(),
                hunt.getDifficulty(),
                hunt.getCreator().getPseudo(),
                hunt.isActive(),
                hunt.getCreatedAt()
        );
    }
}
