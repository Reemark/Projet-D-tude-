package uncharted.demo.service;

import org.springframework.stereotype.Service;
import uncharted.demo.dto.ParticipationDto;
import uncharted.demo.exception.BadRequestException;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.Hunt;
import uncharted.demo.model.Participation;
import uncharted.demo.model.User;
import uncharted.demo.repository.HuntRepository;
import uncharted.demo.repository.ParticipationRepository;
import uncharted.demo.repository.UserRepository;

import java.util.List;

@Service
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final UserRepository userRepository;
    private final HuntRepository huntRepository;

    public ParticipationService(ParticipationRepository participationRepository,
                                UserRepository userRepository, HuntRepository huntRepository) {
        this.participationRepository = participationRepository;
        this.userRepository = userRepository;
        this.huntRepository = huntRepository;
    }

    public ParticipationDto.Response join(Integer huntId, String email, String secretCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        Hunt hunt = huntRepository.findById(huntId)
                .orElseThrow(() -> new NotFoundException("Chasse non trouvée"));

        if (hunt.getSecretCode() != null) {
            if (secretCode == null || !hunt.getSecretCode().equals(secretCode.trim())) {
                throw new BadRequestException("Code secret incorrect");
            }
        }

        if (participationRepository.existsByUserIdAndHuntId(user.getId(), huntId)) {
            throw new BadRequestException("Déjà inscrit à cette chasse");
        }

        Participation participation = new Participation();
        participation.setUser(user);
        participation.setHunt(hunt);
        participation = participationRepository.save(participation);

        return toResponse(participation);
    }

    public List<ParticipationDto.Response> getMyParticipations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        return participationRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    private ParticipationDto.Response toResponse(Participation p) {
        return new ParticipationDto.Response(
                p.getId(),
                p.getHunt().getId(),
                p.getHunt().getTitle(),
                p.getUser().getPseudo(),
                p.getStatus(),
                p.getScore(),
                p.getCreatedAt()
        );
    }
}
