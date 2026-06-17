package uncharted.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uncharted.demo.dto.HuntDto;
import uncharted.demo.exception.ForbiddenException;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.Hunt;
import uncharted.demo.model.Step;
import uncharted.demo.model.User;
import uncharted.demo.repository.HuntRepository;
import uncharted.demo.repository.ParticipationRepository;
import uncharted.demo.repository.StepRepository;
import uncharted.demo.repository.UserProgressRepository;
import uncharted.demo.repository.UserRepository;

import java.util.List;

@Service
public class HuntService {

    private final HuntRepository huntRepository;
    private final UserRepository userRepository;
    private final StepRepository stepRepository;
    private final ParticipationRepository participationRepository;
    private final UserProgressRepository userProgressRepository;

    public HuntService(HuntRepository huntRepository, UserRepository userRepository,
                       StepRepository stepRepository, ParticipationRepository participationRepository,
                       UserProgressRepository userProgressRepository) {
        this.huntRepository = huntRepository;
        this.userRepository = userRepository;
        this.stepRepository = stepRepository;
        this.participationRepository = participationRepository;
        this.userProgressRepository = userProgressRepository;
    }

    public HuntDto.Response create(HuntDto.CreateRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        Hunt hunt = new Hunt();
        hunt.setTitle(request.title());
        hunt.setDescription(request.description());
        hunt.setDifficulty(request.difficulty());
        hunt.setCreator(creator);
        if (request.secretCode() != null && !request.secretCode().isBlank()) {
            hunt.setSecretCode(request.secretCode().trim());
        }
        hunt = huntRepository.save(hunt);

        return toResponse(hunt);
    }

    public HuntDto.Response update(Integer id, HuntDto.UpdateRequest request, String email) {
        Hunt hunt = huntRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chasse non trouvée"));
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        boolean isOwner = hunt.getCreator().getEmail().equals(email);
        boolean isAdmin = requester.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Non autorisé à modifier cette chasse");
        }
        hunt.setTitle(request.title());
        hunt.setDescription(request.description());
        hunt.setDifficulty(request.difficulty());
        if (request.secretCode() != null && !request.secretCode().isBlank()) {
            hunt.setSecretCode(request.secretCode().trim());
        } else {
            hunt.setSecretCode(null);
        }
        return toResponse(huntRepository.save(hunt));
    }

    public List<HuntDto.Response> getAllActive() {
        return huntRepository.findByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    public HuntDto.Response getById(Integer id) {
        Hunt hunt = huntRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chasse non trouvée"));
        return toResponse(hunt);
    }

    public List<HuntDto.Response> getByCreator(String email) {
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        return huntRepository.findByCreator(creator).stream().map(this::toResponse).toList();
    }

    @Transactional
    public void delete(Integer id, String email) {
        Hunt hunt = huntRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chasse non trouvée"));
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        boolean isOwner = hunt.getCreator().getEmail().equals(email);
        boolean isAdmin = requester.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Non autorisé à supprimer cette chasse");
        }
        // Supprimer progression, étapes et participations avant la chasse
        userProgressRepository.deleteByHuntId(id);
        stepRepository.deleteAll(stepRepository.findByHuntIdOrderByStepOrderAsc(id));
        participationRepository.deleteAll(participationRepository.findByHuntId(id));
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
                hunt.getSecretCode() != null,
                hunt.getCreatedAt()
        );
    }
}
