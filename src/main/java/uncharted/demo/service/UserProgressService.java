package uncharted.demo.service;

import org.springframework.stereotype.Service;
import uncharted.demo.dto.UserProgressDto;
import uncharted.demo.exception.BadRequestException;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.*;
import uncharted.demo.repository.*;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final UserRepository userRepository;
    private final StepRepository stepRepository;
    private final ParticipationRepository participationRepository;

    public UserProgressService(UserProgressRepository userProgressRepository,
                               UserRepository userRepository,
                               StepRepository stepRepository,
                               ParticipationRepository participationRepository) {
        this.userProgressRepository = userProgressRepository;
        this.userRepository = userRepository;
        this.stepRepository = stepRepository;
        this.participationRepository = participationRepository;
    }

    public UserProgressDto.Response dig(Integer stepId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        Step step = stepRepository.findById(stepId)
                .orElseThrow(() -> new NotFoundException("Étape non trouvée"));

        if (!participationRepository.existsByUserIdAndHuntId(user.getId(), step.getHunt().getId())) {
            throw new BadRequestException("Vous ne participez pas à cette chasse");
        }

        UserProgress progress = userProgressRepository.findByUserIdAndStepId(user.getId(), stepId)
                .orElseGet(() -> {
                    UserProgress p = new UserProgress();
                    p.setUser(user);
                    p.setHunt(step.getHunt());
                    p.setStep(step);
                    return p;
                });

        if (progress.isCompleted()) {
            throw new BadRequestException("Étape déjà complétée");
        }

        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progress = userProgressRepository.save(progress);

        Participation participation = participationRepository
                .findByUserIdAndHuntId(user.getId(), step.getHunt().getId())
                .orElseThrow(() -> new NotFoundException("Participation non trouvée"));
        participation.setScore(participation.getScore() + step.getScore());
        participationRepository.save(participation);

        return toResponse(progress);
    }

    public List<UserProgressDto.Response> getProgress(Integer huntId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        return userProgressRepository.findByUserIdAndHuntId(user.getId(), huntId)
                .stream().map(this::toResponse).toList();
    }

    private UserProgressDto.Response toResponse(UserProgress p) {
        return new UserProgressDto.Response(
                p.getId(),
                p.getStep().getId(),
                p.getStep().getStepOrder(),
                p.isCompleted(),
                p.getCompletedAt()
        );
    }
}
